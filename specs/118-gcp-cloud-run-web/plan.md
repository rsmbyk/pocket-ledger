# Plan 118: Cloud Run web + path-filtered Actions; retire Cloudflare

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 115 HOSTING; Spec 116 CI; Spec 117 Kit static

## Why

Cloudflare is out. Web static assets belong on Cloud Run. Deploy web only when `apps/web` (or equivalent) changes. API deploy is a later slice (119+) but the workspace + `Dockerfile.web` and path filters should exist so an API service can be added without redeploying web.

## Approach

npm workspaces: `apps/web` (static Kit) and `apps/api` stub (Hono hello or healthz — no Google yet). `Dockerfile.web` serves static files. GHA: path filter `apps/web/**` → web Cloud Run; `apps/api/**` → API Cloud Run (stub may no-op until 119). Retire wrangler as production. Document origin change = empty IDB.

## Scope / edges

**In:** workspaces, Cloud Run web, filters, retire Cloudflare prod, API stub container optional.

**Out:** Google Sign-In, wrapping, real sync endpoints (119–121).
