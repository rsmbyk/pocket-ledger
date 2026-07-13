# Pocket Ledger

Offline-first personal finance tracker. Mobile-first PWA, data stays on your device (IndexedDB), deployed as a static site on GitHub Pages.

## Stack

- Svelte 5 (runes) + Vite + TypeScript
- shadcn-svelte + Tailwind CSS v4
- Dexie (IndexedDB)
- vite-plugin-pwa
- Vitest + Playwright
- Spec-Driven Development + TDD + GitHub Flow

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

GitHub Pages production build (base path `/pocket-ledger/`):

```bash
# Unix
GITHUB_PAGES=true npm run build

# PowerShell
$env:GITHUB_PAGES='true'; npm run build
```

## Process

Read these before changing behavior:

| Doc | Purpose |
|-----|---------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Locked product decisions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered client architecture |
| [docs/PROCESS.md](docs/PROCESS.md) | SDD + TDD + GitHub Flow |
| [docs/FIRST_WORK.md](docs/FIRST_WORK.md) | Scaffold scope |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Feature order |
| [specs/](specs/) | Living behavior specs |

## License

Private personal project unless otherwise stated in the repository settings.
