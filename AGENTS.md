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

npm-workspaces monorepo (Node 22): `apps/web` (SvelteKit, `adapter-static`) + `apps/api` (Hono on Node). The VM starts with deps installed by the startup update script (`npm ci` + `npx playwright install chromium`). Standard commands live in `README.md` / root `package.json`. Notes below are the non-obvious gotchas.

- `npm ci` at the repo root installs BOTH workspaces (hoisted `node_modules`) — there is no per-app install step.
- Playwright Chromium is needed for more than E2E: the `apps/web` Vitest `client` project runs in **real Chromium** (`@vitest/browser-playwright`), so a missing browser breaks `npm run test:unit:run` too. Re-run `npx playwright install chromium` if you hit "browser not found". Unit run = web (`apps/web`) + api (`apps/api`).
- Two run modes:
  - `npm run dev` (web only, port 5173) = signed-out, **local-only** PWA (Dexie/IndexedDB). No API, no Google sign-in — nothing to provision.
  - Full stack (needed for sign-in + cloud sync) = web + `npm run dev:api`. The API uses an in-memory store unless `DATABASE_URL` is set (Spec 178 / Cloud SQL in production).
- Full-stack local recipe (fake Google, no real OAuth). Use `127.0.0.1` everywhere so the API's CORS `WEB_ORIGIN` exactly matches the browser origin (do NOT mix `localhost` and `127.0.0.1`):
  - API: `WEB_ORIGIN=http://127.0.0.1:5173 PORT=8080 npm run dev:api` (the `dev:api` script already sets `COOKIE_SECURE=0 AUTH_ALLOW_FAKE=1`; API health at `/healthz`).
  - Web: run Vite **inside `apps/web`** to avoid nested-`npm -w` argument mangling: `cd apps/web && VITE_API_URL=http://127.0.0.1:8080 VITE_FAKE_GOOGLE=1 npx vite dev --host 127.0.0.1 --port 5173`.
  - Open `http://127.0.0.1:5173` → More → "Sign in with Google" (fake token, no popup) → set passphrase + save recovery kit. Sync then hits `GET/PUT /v1/sync` on the API with the `pl_session` cookie.
- `npm run test:e2e` self-starts BOTH the API (:8787) and the web preview (:4173) with fake auth (see root `playwright.config.ts`) — do NOT start servers manually for E2E.
- Dev-only console noise (safe to ignore): `vite dev` does not emit the PWA `sw.js` (service-worker MIME error) — it only exists in `build`/`preview`, which the E2E "registers a service worker" test covers; and `GET /v1/me` returns 401 until you sign in.
- `npm run check` (svelte-check + tsc for web, `node --check` for api) passes cleanly. **`npm run lint` is currently broken repo-wide** (it errors out, not just formatting warnings): root `prettier.config.js` sets `tailwindStylesheet: './src/app.css'`, a path left over from before the monorepo move — the stylesheet now lives at `apps/web/src/app.css`, so `prettier-plugin-tailwindcss` throws `ENOENT` on every JS file. Fixing that one path restores lint; do NOT mass-reformat the repo to work around it.
