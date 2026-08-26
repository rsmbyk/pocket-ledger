# Plan 115: Docs unlock — local-first + optional cloud

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Living docs still say client-only Cloudflare, no backend, hash router, plaintext JSON backup, and encryption off-by-default. The product is now two modes (signed-out Dexie vs signed-in Google E2E sync on GCP). Repo docs must be the source of truth when this slice is Accepted — not only the Cursor plan.

## Approach

Update PRODUCT, ARCHITECTURE, HOSTING, ROADMAP, AGENTS, PROCESS (hosting/CI sentences), and add ADRs for GCP two-service layout, E2E wrapping, and superseding Cloudflare. Record **decided / dropped / parked** and the main flows.

## Scope / edges

**In:** documentation only (and spec index).

**Out:** `src/**`, workspaces, Cloud Run, auth, wrapping code, sync.
