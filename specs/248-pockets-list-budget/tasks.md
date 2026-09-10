# Tasks 248: Sticky groups, unique scope, list preview

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/248-pockets-list-budget`
- [x] **Red Vitest** sticky used includes a category added after save; demote does not; `budgetScopeKey`; fees still ignored on group scope
- [x] **Green** `groupIds` + hydrate + `txContribution` catalog expand
- [x] Dexie v12 `groupIds`; backup/sync blob round-trip
- [x] Application: refuse duplicate pocket-wide / Groceries; Home sticky vs Groceries allowed; drop then recreate allowed
- [x] Form: Select all disabled when another active pocket-wide exists; duplicate leftover errors on Save
- [x] Pockets list: pocket-wide chrome between info and goal; bars span middle+right (not grip); drop `max-w-xs`
- [x] Playwright `e2e/budgets.e2e.ts`
- [x] Index in `specs/README.md`; DATA_MODEL `groupIds`
