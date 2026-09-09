# Tasks 246: Pocket budgets

- [x] Spec Accepted by Ronald
- [x] Branch `feat/246-budgets`
- [x] **Red Vitest** `apps/web/src/lib/domain/budgets.test.ts` — `effectiveStartOn`; contribution (category vs pocket, fees, transfer-out, void, window); exceed; bar fill mirror; percent unclamped; title collapse; group check / Select all; sort
- [x] **Green** `apps/web/src/lib/domain/budgets.ts`
- [x] **Red Vitest** `apps/web/src/lib/application/budget-form-dirty.test.ts`
- [x] **Green** `apps/web/src/lib/application/budget-form-dirty.ts`
- [x] **Red Vitest** `apps/web/src/lib/application/budgets.test.ts` — create/update/drop/restart; refuse past `startOn` after today; pocket-wide vs categories
- [x] **Green** Dexie v11 `budgets`; `budgets-repo.ts`; `application/budgets.ts`; backup + reset + `local-has-data`; sync `kind: 'budget'`
- [x] **Red Vitest** `apps/web/src/lib/application/accounts.test.ts` — `deletePocket` refuses active budgets
- [x] **Green** delete blocker + cascade Drop
- [x] UI: Budgets card between Plans and Goals; form dialog; list row chrome; DateField `max`; ConfirmDialog overlay-ignore
- [x] Tx save intercept in `QuickAddSheet.svelte` (warn vs hard)
- [x] Playwright `e2e/budgets.e2e.ts` + details order in `e2e/pocket-details.e2e.ts`
- [x] Docs: `docs/PRODUCT.md`, `docs/DATA_MODEL.md`, Architecture kind list; index this spec Accepted
- [x] `npm run check` + targeted unit/e2e
