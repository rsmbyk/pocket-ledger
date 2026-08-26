# Pocket Ledger

Local-first personal finance tracker with optional Google cloud sync. Signed-out: PWA, data stays on the device (IndexedDB). Signed-in: E2E ciphertext on GCP; we never have the passphrase.

**Live (until Cloud Run cutover):** https://pocket-ledger.ronaldsumbayak611.workers.dev/

## Stack

- Svelte 5 (runes) + TypeScript (SvelteKit path URLs + PWA — Spec 117)
- shadcn-svelte + Tailwind CSS v4
- Dexie (IndexedDB; cache when signed in)
- Hono API + Cloud SQL (signed-in, Specs 119–121)
- Vitest + Playwright
- Spec-Driven Development + TDD + GitHub Flow
- Hosting target: **GCP Cloud Run** (web + API). See [docs/HOSTING.md](docs/HOSTING.md).

## Quick start

With Node on the host:

```bash
npm install
npm run dev
```

With Docker (from `/home/rsmbyk/projects/pocket-ledger`):

```bash
docker compose up --build
```

Then open http://localhost:5173 — see [docs/HOSTING.md](docs/HOSTING.md).

```bash
npm run check
npm run test:unit:run
npx playwright install chromium
npm run test:e2e
npm run build
```

## Deploy

**Production:** path-filtered GitHub Actions → Cloud Run (`deploy-web.yml` vs `deploy-api.yml`). A web-only change does not deploy the API service, and vice versa. Set repo variables `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA` (optional `GCP_REGION`). Until those exist, deploy jobs skip Cloud Run.

Cutover is a **new origin** = empty IndexedDB.

See [docs/HOSTING.md](docs/HOSTING.md).

## Process

Read these before changing behavior:

| Doc | Purpose |
|-----|---------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Locked product decisions (two modes, dropped/parked) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, wrapping, workspaces |
| [docs/PROCESS.md](docs/PROCESS.md) | SDD + TDD + GitHub Flow |
| [docs/HOSTING.md](docs/HOSTING.md) | GCP Cloud Run (Cloudflare until cutover) |
| [docs/FIRST_WORK.md](docs/FIRST_WORK.md) | Scaffold scope |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Feature order |
| [specs/](specs/) | Living behavior specs |

## License

Private personal project unless otherwise stated in the repository settings.
