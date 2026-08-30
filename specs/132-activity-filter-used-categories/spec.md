# Spec 132: Activity category filter used-only

- **ID:** 132
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Activity Filters’ Category dropdown only offers categories that actually appear on the ledger (including voided rows). If nothing is categorized, the control is omitted.

## Scope

### In scope

1. **Used-only options** — Activity filter `CategoryPicker` lists a category iff some ledger transaction has that `categoryId`, **including voided**. Hidden categories are included when still referenced. Empty groups drop out.
2. **Sentinels** — Uncategorized and Admin Fee appear only if they are in use (null `categoryId` / transfer with fee) **and** the Category control is shown.
3. **Hide the control** — Hide the Category **label and picker** when there are **no transactions**, or **no transaction has a non-empty user `categoryId`**. Set draft and applied category filter to All (no stale id).
4. **Transfer type** — When the control is visible, Transfer still disables it and forces All (107).
5. **Scope of “used”** — Entire ledger, not the currently filtered Activity list (date/type/search do not shrink the option list).

### Out of scope

- Transaction sheet / add-in-group CategoryPicker (still visible catalog, hidden omitted — 123)
- Changing `filterTransactions` match semantics
- Pocket filter
- Android

## Domain / UI rules

Pure helpers in `activity-filters.ts` (names may vary):

- `usedCategoryIds(transactions)` → set of non-empty `categoryId` values; **do not skip voided**.
- `shouldShowActivityCategoryFilter(transactions)` → true iff `usedCategoryIds` is non-empty.

When the control is hidden, UI treats category as All (`''`). 107 compatibility helpers still apply when the control is shown.

## Acceptance scenarios

### Scenario: Empty ledger hides Category

- **Given** no transactions
- **When** Activity Filters are shown
- **Then** `activity-filter-category` is not in the document
- **And** the applied category filter is All

### Scenario: Uncategorized-only hides Category

- **Given** only income/expense rows with null `categoryId` (and/or transfers with no user category)
- **When** Activity Filters are shown
- **Then** the Category control is hidden

### Scenario: Used category appears; unused catalog does not

- **Given** one non-voided Salary transaction and the rest of the stock catalog unused
- **When** the user opens the Activity category picker
- **Then** Salary is listed
- **And** Bonus is not listed

### Scenario: Voided still counts as used

- **Given** the only Grocery transaction is voided
- **When** the user opens the Activity category picker
- **Then** Groceries is listed
- **And** the Category control is visible

### Scenario: Hidden-but-referenced still listed

- **Given** a hidden category that is still the `categoryId` on a transaction
- **When** the Activity category picker opens
- **Then** that category is listed

### Scenario: Tx sheet picker unchanged

- **Given** the same ledger as “used category appears”
- **When** the user opens Add Transaction category
- **Then** unused catalog categories (e.g. Bonus) are still listed (if not hidden)

## Traceability

- Vitest: `apps/web/src/lib/domain/activity-filters.test.ts` (`usedCategoryIds` includes voided; empty/uncategorized-only → `shouldShow` false)
- Playwright: `e2e/activity-filters.e2e.ts` (empty: no picker; after one categorized tx: picker lists only that id); existing Transfer-disabled tests still run when a used category exists
- Implementation: `activity-filters.ts` helpers; `AppShellChrome.svelte` / `App.svelte` wiring for filter picker only
- Docs: this folder; `specs/README.md` index
- Depends on: 017, 107, 123
- Related: 130 (search over the reduced list)

## Related

- 107 grouping / Transfer disable; 106 Admin Fee sentinel
