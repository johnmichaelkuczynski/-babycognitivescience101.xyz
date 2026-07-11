---
name: Google OAuth on Replit — three required fixes
description: Three non-obvious things that must all be true for Google OAuth to work in this stack (passport + express-session + Replit proxy).
---

Three bugs must all be fixed together — any one missing breaks login:

**1. Proxy paths must include `/auth`**
`artifact.toml` `paths` defaults to `["/api"]`. OAuth routes (`/auth/google`, `/auth/google/callback`) are NOT under `/api`, so they hit the frontend instead of the API server. Fix via `verifyAndReplaceArtifactToml` to add `"/auth"` to paths. Requires a fresh deploy to take effect in production.

**Why:** Replit's path-based proxy only forwards requests whose paths match a registered prefix. Auth routes that don't share the API prefix are silently swallowed by the frontend.

**2. Session table must be created manually**
`connect-pg-simple`'s `createTableIfMissing: true` reads a bundled `table.sql` asset at startup. esbuild does not copy that asset into `dist/`, causing ENOENT. Sessions appear to work but nothing is persisted to the DB, so every page load loses the authenticated user.

Fix: fire-and-forget `pool.query(CREATE TABLE IF NOT EXISTS "user_sessions" ...)` before constructing PgSession, and set `createTableIfMissing: false`.

**Why:** esbuild bundles JS only; non-JS assets from node_modules are not included unless explicitly configured.

**3. OAuth link must use `target="_top"`**
The Replit workspace embeds the app in an iframe. A plain `<a href="/auth/google">` navigates the iframe. Google's auth pages set `X-Frame-Options`/`frame-ancestors` and refuse to render inside iframes — the OAuth flow silently fails or shows a blank/error page.

Fix: `<a href="..." target="_top">` breaks navigation out to the top-level browser context.

**Why:** This only affects the workspace preview (iframe). Production (full-page) works without it, but dev will always fail without `target="_top"`.

**How to apply:** Any time Google OAuth is added to a Replit app using passport + express-session + esbuild, apply all three fixes before testing.
