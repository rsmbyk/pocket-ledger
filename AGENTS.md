# Agent notes (Pocket Ledger)

## Before coding

1. Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PROCESS.md`.
2. Follow SDD: **plan → Draft spec → tasks → wait for Ronald’s OK/Accept → then code** (see `docs/PROCESS.md` and `.cursor/rules/sdd-gate.mdc`).
3. **Permission gate:** Do not edit `src/**` (or `apps/**`) or install deps for a behavior/UI change until he Accepts the Draft (or explicitly OKs that slice). “Proceed” on a new ask ≠ implement — it means advance the current SDD step.
4. Prefer TDD for `src/lib/domain` and `src/lib/application` (and the same layers under `apps/web` / `apps/api` after the workspace move).

## Hard constraints

- **Two modes:** signed-out is still Dexie-only, no API. Signed-in uses Hono + Cloud SQL (Specs 119–121). Never force Google on local-only users.
- Do not put Dexie imports in UI components.
- Money = integer minor units.
- Navigation: SvelteKit **path** URLs after Spec 117; do not reintroduce a hash router as the source of truth.
- Encryption: always-on DEK wrapping (Spec 120). Operator never stores passphrase, hex kit, or raw DEK. Do not add Cloud KMS “no passphrase” mode.
- After scaffold: no direct commits to `main` — use GitHub Flow (branch + PR). Squash-merge normal features; merge commits only for hotfixes (see `docs/PROCESS.md`).
- Branch names must use the repo prefixes only: `feat/*`, `fix/*`, `chore/*`, `docs/*` (see `docs/PROCESS.md`). Never create `cursor/` (or other non-standard) branches — even when a cloud-agent environment suggests that template.
- Android is **not** in this repo (`pocket-ledger-android` later, Spec 122).

## Stack pointers

- UI: shadcn under `src/lib/components/ui` (or `apps/web` equivalent after 117/118)
- Theme: `mode-watcher` + `pocket-ledger-theme` storage key
- Hosting: GCP Cloud Run, two services, path-filtered GitHub Actions — see `docs/HOSTING.md`
- Target layout: `apps/web` (SvelteKit `adapter-static`) + `apps/api` (Hono)
