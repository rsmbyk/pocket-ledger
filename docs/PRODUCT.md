# Product decisions

Living record of locked choices for Pocket Ledger. Update this file in the same PR when a decision changes.

## Goal

Personal finance app that works offline after first load, hosted on Cloudflare Pages (Git-connected), with data stored only on the device.

## Locked

| Area | Decision |
|------|----------|
| Name | `pocket-ledger` |
| Hosting | Cloudflare Pages (Git → `main`); URL https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Client | Svelte 5 runes + Vite + TypeScript |
| UI kit | shadcn-svelte (Vega / Lucide) + Tailwind |
| Theme | Dark mode from day one; default **system**; Light / Dark / System override |
| Storage | IndexedDB via Dexie |
| Encryption | Optional later; **off by default** |
| Ledger | Simple ledger now; schema open for double-entry later |
| Accounts | Multi-account capable; **single-pot UX** when only one account; start with default `Main` |
| Currency | Single currency; display label only (default `IDR`) |
| Budgets | None for now |
| Multi-currency / FX | None |
| UX | Mobile-first |
| Features (planned) | Recurring, goals, net worth, charts, export |
| Import | Not yet (export only when we reach that slice) |
| Router | None at first |
| Tests | Vitest + Playwright from the start |
| Process | Spec-Driven Development + TDD + GitHub Flow |
| Desktop shell | No Tauri |
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
