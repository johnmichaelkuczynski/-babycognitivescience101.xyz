---
name: api-server esbuild externals
description: Packages that break when bundled by the api-server esbuild build and must be externalized
---
Rule: if the api-server crashes at start with `Cannot find module ...` deep inside a dependency (e.g. `@swc/helpers/...` via fontkit when using pdfkit), do NOT chase the missing helper — add the top-level package (e.g. `"pdfkit"`) to the `external` array in `artifacts/api-server/build.mjs` and rebuild.

**Why:** the build bundles everything into one ESM file; packages with CJS asset/data loading (pdfkit→fontkit .afm fonts, brotli) can't be bundled. The banner injects a global `require`, so externalized packages resolve fine from node_modules at runtime (they must be listed in api-server's package.json deps).

**How to apply:** any new server dependency that reads sibling data files or uses dynamic CJS requires → externalize it, restart the workflow (dev build = bundle + start), and confirm boot.
