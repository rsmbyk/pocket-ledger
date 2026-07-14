# Pocket Ledger

Offline-first personal finance tracker. Mobile-first PWA, data stays on your device (IndexedDB).

**Live:** https://pocket-ledger.ronaldsumbayak611.workers.dev/

## Stack

- Svelte 5 (runes) + Vite + TypeScript
- shadcn-svelte + Tailwind CSS v4
- Dexie (IndexedDB)
- vite-plugin-pwa
- Vitest + Playwright
- Spec-Driven Development + TDD + GitHub Flow
- Hosting: **Cloudflare Workers** static assets (Git-connected to this repo)

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run check
npm run test:unit:run
npx playwright install chromium
npm run test:e2e
npm run build
```

## Deploy

Production deploys automatically from `main` via Cloudflare’s Git integration (not GitHub Actions).

Build settings (Cloudflare dashboard):

- Build command: `npm run build`
- Output directory: `dist`

See [docs/HOSTING.md](docs/HOSTING.md).

## Process

Read these before changing behavior:

| Doc | Purpose |
|-----|---------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Locked product decisions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered client architecture |
| [docs/PROCESS.md](docs/PROCESS.md) | SDD + TDD + GitHub Flow |
| [docs/HOSTING.md](docs/HOSTING.md) | Cloudflare Workers deploy |
| [docs/FIRST_WORK.md](docs/FIRST_WORK.md) | Scaffold scope |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Feature order |
| [specs/](specs/) | Living behavior specs |

## License

Private personal project unless otherwise stated in the repository settings.
