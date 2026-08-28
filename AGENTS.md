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

## Cursor Cloud specific instructions

The VM starts with dependencies already installed by the startup update script (`npm ci` + `npx playwright install chromium`). Standard commands live in `README.md` and `package.json` scripts — use those. Notes below are only the non-obvious gotchas.

- Single client-only PWA, no backend/DB. "Running the app" = one Vite process: `npm run dev` (port 5173). All data lives in the browser (IndexedDB via Dexie), so there is nothing to provision or seed.
- Tests need the Playwright Chromium browser, and not just the E2E suite: the Vitest `client` project runs in **real Chromium** (`@vitest/browser-playwright`), so a missing browser breaks `npm run test:unit:run` too, not only `npm run test:e2e`. The update script installs it; if you ever hit a "browser not found" error, re-run `npx playwright install chromium`.
- `npm run test:e2e` self-builds and self-serves the app on port 4173 (see `playwright.config.ts`) — do NOT start a server manually for E2E.
- `npm run lint` (`prettier --check .`) currently reports pre-existing formatting drift across many tracked files on a clean checkout (the repo is not fully formatted against its own `prettier.config.js`). A failing `npm run lint` is the baseline, not something your change broke — and do NOT mass-reformat the repo to "fix" it. `npm run check` (svelte-check + tsc) does pass cleanly.
