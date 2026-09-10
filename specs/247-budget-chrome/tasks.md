# Tasks 247: Budget form/details chrome

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/247-budget-chrome`
- [x] **Red Vitest** `sortActiveBudgets` keys (pocket-wide, percent, limit, effectiveStartOn, monthly, hard, createdAt/id)
- [x] **Green** `sortActiveBudgets(..., today)`
- [x] Select all `disabled={isAllSelectable}`
- [x] Landmark on pocket-wide details titles
- [x] Restart `disabled` when `initialStartOn === today`
- [x] Applies to search via `filterCatalogGroups`
- [x] Even `gap-1`; omit empty badge strip
- [x] Playwright `e2e/budgets.e2e.ts`
- [x] Index in `specs/README.md`
