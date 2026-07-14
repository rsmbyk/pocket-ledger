# First work (scaffold)

Status: implemented as the repository starting point.

## In scope

- Vite + Svelte 5 + TypeScript
- shadcn-svelte starter components
- Dark mode (system default + Light/Dark/System)
- PWA polish (manifest, icons, SW, offline fallback page)
- Dexie schema v1 + default `Main` account (single-pot)
- Layered folders + `ensureDefaultAccount` use case
- Vitest + Playwright + `specs/000-scaffold.md`
- Docs (product, architecture, process, ADRs, roadmap)
- Public GitHub repo

**Follow-up:** hosting migrated to Cloudflare Workers (Git-connected); see ADR 0006. GitHub Actions CI was removed after billing blocked workflow runs.

## Out of scope

- Transaction CRUD, charts, recurring, goals, net worth
- Export / import
- Encryption implementation
- Router
- Budgets / multi-currency
