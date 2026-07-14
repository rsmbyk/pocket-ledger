# Agent notes (Pocket Ledger)

## Before coding

1. Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PROCESS.md`.
2. For behavior changes: update or add a file under `specs/` first (SDD).
3. Prefer TDD for `src/lib/domain` and `src/lib/application`.

## Hard constraints

- No backend. Static Cloudflare Pages + IndexedDB only.
- Do not put Dexie imports in UI components.
- Money = integer minor units.
- Do not add a router unless navigation pain is documented in a spec.
- Encryption stays off unless implementing that feature slice.
- After scaffold: no direct commits to `main` — use GitHub Flow (branch + PR). Squash-merge normal features; merge commits only for hotfixes (see `docs/PROCESS.md`).

## Stack pointers

- UI: shadcn under `src/lib/components/ui`
- Theme: `mode-watcher` + `pocket-ledger-theme` storage key
- Hosting: Cloudflare Pages at site root (`base: '/'`) — see `docs/HOSTING.md`
