# Spec 244: Plans category filter

- **ID:** 244
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

`/plans` Filters include **Category** with the same contract as Transactions, applied to **active Plans** (not the ledger). Type, Category, Pocket. No date range, no Show voided.

## Scope

### In scope

1. `PlanFilterCriteria.categoryIds` (empty = All). `filterPlans` matches like Activity: user id, Uncategorized (`null` `categoryId`), Admin Fee (sentinel or transfer/expense with `feeMinor > 0`). OR within Category; AND with type/pocket/search.
2. Used-only options from active Plans. Hidden-but-referenced still listed. Unused catalog omitted.
3. Hide Category (label + picker) when no plan has a non-empty user `categoryId` and no Admin Fee plan row; snap draft/applied `categoryIds` to All.
4. Uncategorized / Admin Fee sentinels only when in use on plans **and** the control is shown.
5. Transfer-only Type disables Category and forces All (107). Type change drops incompatible selected ids.
6. Shared `CategoryPicker` (`multiple`, `emptyMeans="all"`, `testid="plans-filter-category"`) between Type and Pocket on sheet and xl card.
7. Filters badge counts Category when non-empty. Session `pocket-ledger-plans-list` persists `categoryIds`.

### Out of scope

- Home / pocket-details plan cards
- Show voided, date range
- Changing Activity Category
- Multi-select semantics beyond 139 (empty = All)

## Domain / UI rules

- **Supersedes 223** “Filters: type and pocket only” / scenario “Plans filters are type and pocket only”.
- Helpers in `plan-filters.ts`: `usedPlanCategoryIds`, `shouldShowPlanCategoryFilter`, `hasUncategorizedPlanRow`, `hasAdminFeePlanRow`. Do not pass Plans into `usedCategoryIds(transactions)`.
- Reuse `isCategoryFilterDisabled`, `resolveCategoryIdsForTypes`, `ADMIN_FEE_CATEGORY_ID`, `UNCATEGORIZED_FILTER`.
- Control order: Type, Category, Pocket.

## Acceptance scenarios

### Scenario: Empty plans hides Category

- **Given** no Plans
- **When** Filters are shown
- **Then** `plans-filter-category` is not in the document
- **And** there is no date range or show-voided control

### Scenario: Used category appears; unused catalog does not

- **Given** one Plan categorized Food and the rest of the stock catalog unused
- **When** the user opens the Plans category picker
- **Then** Food is listed
- **And** Groceries is not listed

### Scenario: Transfer disables category

- **Given** Category is visible (a categorized Plan exists)
- **When** the user selects type Transfer only
- **Then** the category picker is disabled and shows All

### Scenario: Apply category filters the list

- **Given** a Food Plan and an uncategorized Plan
- **When** the user selects Food and Applies
- **Then** only the Food Plan is listed

### Scenario: Incompatible category cleared on type change

- **Given** draft type All and category Food selected
- **When** the user changes type to Income only
- **Then** draft category resets to All

## Traceability

- Vitest: `apps/web/src/lib/domain/plan-filters.test.ts`; `apps/web/src/lib/shared/plans-list-session.test.ts`
- Playwright: `e2e/plans.e2e.ts`
- Implementation: `plan-filters.ts`; `plans-list-session.ts`; `AppShellChrome.svelte` `planFilterFormFields`
- Docs: `docs/PRODUCT.md` Plans filters are type, category, and pocket

## Related

- 107, 132, 139, 144, 223, 243
