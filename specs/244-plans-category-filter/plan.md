# Plan 244: Plans category filter

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 223, 107, 132, 139, 243
- **Related:** 144 Type/Pocket check menus (already on Plans)

## Why

Plans filters are type and pocket only (223). Transactions already filters by Category (used-only picker, type coupling, Uncategorized / Admin Fee). Plans have `categoryId` and `feeMinor`; the list cannot match them.

## Approach

Add `categoryIds` to `PlanFilterCriteria` (empty = All). Match like Activity (`matchesCategories`). Used-only helpers in `plan-filters.ts` from **active Plans**, not the ledger. UI: shared `CategoryPicker` between Type and Pocket (`plans-filter-category`). Reuse `resolveCategoryIdsForTypes` / `isCategoryFilterDisabled`. Persist in `pocket-ledger-plans-list`. Badge counts Category.

## TDD

Red Vitest `plan-filters.test.ts` + session parse; then UI; Playwright replaces “type and pocket only”.
