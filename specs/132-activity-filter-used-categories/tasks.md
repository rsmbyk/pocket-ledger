# Tasks 132: Activity category filter used-only

TDD helpers; Playwright hide/show. Do not start until Ronald Accepts this Draft.

## Domain

- [ ] Red Vitest `apps/web/src/lib/domain/activity-filters.test.ts` — used ids include voided; skip null; `shouldShowActivityCategoryFilter` false for [] and uncategorized-only; true when one categorized (voided ok)
- [ ] Green helpers in `apps/web/src/lib/domain/activity-filters.ts`

## UI

- [ ] `AppShellChrome.svelte` (and `App.svelte` if lists are built there) — Activity CategoryPicker options = used ids only; omit control when `shouldShow` is false; reset draft/applied category to All; do **not** shrink QuickAddSheet picker
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/activity-filters.e2e.ts` — no txs: `activity-filter-category` absent; add Salary: control visible, Bonus absent; void that tx: Groceries/Salary still listed as specified
- [ ] Existing Transfer disable / type-narrowing tests: seed a used category so the control is present
- [ ] Smoke: add-tx picker still lists unused catalog items

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (activity-filters tests)
- [ ] `npx playwright test e2e/activity-filters.e2e.ts`
- [ ] Manual: empty Activity filters; after one tx; tx sheet still full catalog
