# Tasks 148: Pocket details page

Accepted.

- [x] Branch: `feat/148-pocket-details-page` after Accept (this Draft may live on `docs/148-pocket-details-page`)
- [x] **Red Vitest** `apps/web/src/lib/shared/router.test.ts` — `/pockets/:id` → route `pockets` + id; `/pockets` has no id; `/pockets/a/b` → home
- [x] **Green** `apps/web/src/lib/shared/router.ts`; Kit stub `apps/web/src/routes/pockets/[id]/+page.svelte`
- [x] **Red Vitest** `apps/web/src/lib/domain/month-summary.test.ts` — pocket-scoped Opening (one pocket); income/expense only that pocket; transfer fee on source only; Home/all-pockets path unchanged
- [x] **Green** optional `pocketId` (or equivalent) on `buildMonthSummary`; bounds via `resolveMonthBounds` on that pocket’s txs + `openingAsOf`
- [x] **Red Vitest** latest-10 helper — cap 10; voided excluded; transfer either side; `sortTransactions` order
- [x] **Green** helper; wire Latest card
- [x] **Red Vitest** `apps/web/src/lib/shared/activity-list-session.test.ts` — See more payload = defaults + `pocketIds: [id]` + default month range
- [x] **Green** helper; See more applies **live** applied/draft/range **and** writes session
- [x] UI: list card link; `PocketDetailsPanel` card stack + toolbar Back/title/Edit/hide-amounts; unknown id replace-navigate to `/pockets`; Add Transaction pre-fills pocket
- [x] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files — skipped (no MCP); `svelte-check` clean
- [x] Docs: `docs/PRODUCT.md` (Pockets / Features); `docs/ARCHITECTURE.md` (path list includes `/pockets/:id`); index this spec Accepted in the same PR as the code
- [x] Playwright: `e2e/pocket-details.e2e.ts` — open from card; pencil stays; Back; nav Pockets → list; unknown id; hidden opening/goal; scoped month; latest 10; See more; Add Transaction
- [x] `npm run check` + targeted unit/e2e
- [ ] Manual: deep link, hide-amounts, independent month vs Home, transfer fee source vs dest
