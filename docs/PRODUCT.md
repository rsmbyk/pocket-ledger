# Product decisions

Living record of locked choices for Pocket Ledger. Update this file in the same PR when a decision changes.

## Goal

Personal finance app that works offline after first load, hosted on Cloudflare Pages (Git-connected), with data stored only on the device.

## Locked

| Area | Decision |
|------|----------|
| Name | `pocket-ledger` |
| Hosting | Cloudflare Workers static assets (Git → `main`); URL https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Client | Svelte 5 runes + Vite + TypeScript |
| UI kit | shadcn-svelte (Vega / Lucide) + Tailwind |
| Theme | Dark mode from day one; default **system**; Light / Dark / System override |
| Storage | IndexedDB via Dexie |
| Encryption | Optional; **off by default**; when lock is on, notes/names are AES-GCM at rest |
| Ledger | Simple ledger now; schema open for double-entry later |
| Accounts | Multi-account capable; **single-pot UX** when only one account; start with default `Main` |
| Pockets | User-managed sub-accounts (**Pockets** nav item); `Main` is pinned first, never deleted, always the default for new transactions; non-Main pockets are user-reorderable (drag), renameable, and deletable once empty (spec 070) |
| Pocket opening balance | Each pocket has an opening balance + as-of date that seeds its derived running balance (spec 071) |
| Goals | Per-pocket balance + deadline goal (target amount, target date), not a separate global feature; editable/clearable from the pocket's edit dialog (spec 072) |
| Transfers | Move money between pockets as a single `transfer` transaction (source → dest, one amount, optional note); shown as a neutral (non income/expense) row; editing is void-only (spec 073) |
| Currency | Single currency; display label only (default `IDR`) |
| Budgets | None for now |
| Multi-currency / FX | None |
| UX | **Desktop-first dashboard chrome**, responsive down to mobile (inset sidebar → sheet + stacked layouts below `md`) |
| Features (shipped) | Recurring, charts, export — specs 001–008; net worth UI removed (059); Pockets nav + CRUD, per-pocket opening balance, per-pocket goals, transfers, Activity pocket filter, Activity row pocket labels — specs 070–077 |
| Import | JSON restore (full replace) via More → Backup |
| Lock | Optional passphrase lock, **off by default** (spec 007) |
| Router | Hash routes for Home / Activity / Pockets / Categories / More |
| Categories | Seed set plus user add / rename / delete (unused only) |
| Tests | Vitest + Playwright from the start |
| Process | Spec-Driven Development + TDD + GitHub Flow |
| Desktop shell | No Tauri; desktop-first dashboard shell (inset sidebar + KPI home + wide stage, spec 013) |
| Insights / receipts / household sync | Out of scope for now |

## Non-goals (current)

- Backend / sync server
- Multi-user collaboration
- App Store / Play Store packaging
- Live FX rates

## Privacy model

- App shell is public on Cloudflare; source is on GitHub.
- Ledger data never leaves the browser unless the user exports it (when export ships).
- Clearing site data wipes the ledger — backups matter once export exists.
