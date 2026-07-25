# Tasks 107: Admin Fee selectable for expense transactions

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/application/transactions.test.ts` — add/update expense with Admin Fee sentinel; income rejects sentinel
- [ ] **Green** `resolveCategoryId` / add+update in `src/lib/application/transactions.ts`
- [ ] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — Admin Fee filter unions expenses + fee transfers
- [ ] **Green** filter predicate in `src/lib/domain/activity-filters.ts`
- [ ] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — expense + transfer fee merge under Admin Fee
- [ ] **Green** confirm merge path in `src/lib/domain/month-summary.ts` (likely already works)
- [ ] UI: expense category dropdown offers Admin Fee (system marker) before Uncategorized in `QuickAddSheet.svelte`
- [ ] UI: list/label chrome shows Admin Fee system marker for `categoryId === ADMIN_FEE_CATEGORY_ID`
- [ ] Update `e2e/transfer-admin-fee.e2e.ts` (remove/replace picker-exclusion assertion)
- [ ] Playwright: `e2e/admin-fee-expense.e2e.ts` — create; filter union; chart merge; Categories no row; income excluded
- [ ] Update `docs/PRODUCT.md`
- [ ] `npm run check` + unit + e2e green
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking Spec 107
