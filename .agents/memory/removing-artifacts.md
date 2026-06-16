---
name: Removing an artifact
description: How to delete an artifact cleanly when its workflow is platform-managed.
---

# Removing an artifact

To destroy an artifact (e.g. a stale demo video), **delete its `artifacts/<slug>/` directory**. The platform reconciles and auto-removes the managed workflow + registration.

**Why:** `removeWorkflow({name})` fails for artifact-managed workflows with `PROHIBITED_ACTION` ("managed by an artifact and cannot be deleted via deleteRunWorkflow"). There is no `removeArtifact`/`deleteArtifact` callback. Directory deletion is the supported path.

**How to apply:**
- `rm -rf artifacts/<slug>` — the automatic_updates feed confirms "Removed artifact: …".
- The `artifacts/*` glob in `pnpm-workspace.yaml` needs no edit. Leftover mentions in `BLUEPRINT.md`, `.agents/agent_assets_metadata.toml`, and `pnpm-lock.yaml` are non-runtime and harmless; clean docs if they'd mislead.
