# Tasks 134: Transactions panel (rename + mutations list)

Draft — do not implement until Ronald Accepts.

- [ ] Branch: `feat/134-transactions-panel` after Accept
- [ ] **Red Vitest** `apps/web/src/lib/shared/router.test.ts` — `/transactions`; `/activity` → `transactions`; `routeToPath` is `/transactions`
- [ ] **Green** `apps/web/src/lib/shared/router.ts`; Kit stub `apps/web/src/routes/transactions/+page.svelte`; keep `activity` stub; replace-navigate `/activity` → `/transactions`
- [ ] **Red Vitest** `apps/web/src/lib/domain/activity-filters.test.ts` — always grouped; later day first; same-day newer `createdAt` first; reveal never splits a day; drop sort-mode branches
- [ ] **Green** `sortTransactions` / groups / reveal in `activity-filters.ts`; `ActivityTable.svelte` drops `sortMode`
- [ ] **Red Vitest** `apps/web/src/lib/shared/activity-list-session.test.ts` — filters only; stray `sort` ignored
- [ ] **Green** `activity-list-session.ts`; chrome stops writing sort
- [ ] UI copy: nav, `page-title`, `cmd-transactions`, See more; remove Sort button/sheet
- [ ] Docs: `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`
- [ ] Playwright: `e2e/nav.ts` dest `'transactions'`; `e2e/router.e2e.ts`; `e2e/activity-filters.e2e.ts` (no sort); `e2e/desktop-layout.e2e.ts`; `e2e/recent-see-more.e2e.ts`; leftover `goto('/activity')`
- [ ] `npm run check` + targeted unit/e2e
- [ ] Manual: nav label, `/transactions`, `/activity` redirect, grouped list, Filters only
