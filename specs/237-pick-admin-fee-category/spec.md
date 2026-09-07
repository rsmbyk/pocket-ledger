# Spec 237: Pick Admin Fee on expense Category

- **ID:** 237
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **Expense** add/edit (transaction and Plan), **Admin Fee** is a selectable Category, after user groups and **before Uncategorized**. The amount uses the same synthetic bucket as transfer/expense fees.

## Scope

### In scope

1. Expense Category picker on QuickAdd and Plan sheet: `showAdminFee`, Admin Fee before Uncategorized, percent icon + system label.
2. Persist `categoryId: '__admin_fee__'` (`ADMIN_FEE_CATEGORY_ID`). Not a Dexie category. Uncategorized stays `null`.
3. Income picker does not offer Admin Fee. Switching Expense → Income while Admin Fee is selected clears to Uncategorized.
4. Transfer still has no Category field.
5. Categories panel still has no Admin Fee row.
6. Month expense breakdown: amount with that `categoryId` is Admin Fee (keyed already). Optional `feeMinor` still adds into the same bucket.
7. Lists show Admin Fee (percent icon + label), not Uncategorized.
8. Activity Admin Fee filter: also matches `categoryId === '__admin_fee__'` even when `feeMinor` is 0. `hasAdminFeeLedgerRow` the same. Filter UI unchanged.
9. Accepting a Plan copies the sentinel onto the posted tx.

### Out of scope

- Income Category
- Admin Fee as a Categories-panel row
- Changing filter chrome or order
- Transfer Category

## Domain / UI rules

- `resolveCategoryId` accepts `__admin_fee__` for **expense** only; income still rejects it.
- **Supersedes 106** “Normal category picker has no Admin Fee”.
- **Supersedes 174** “not a pickable `categoryId` on the expense form”.
- Fee sidecar (174 / 106) is unchanged.

## Acceptance scenarios

### Scenario: Expense picker offers Admin Fee before Uncategorized

- **Given** Add Transaction on Expense
- **When** Category opens
- **Then** Admin Fee is listed after user expense groups and immediately before Uncategorized
- **And** Income Category does not list Admin Fee

### Scenario: Save expense as Admin Fee

- **Given** Expense amount `5000`, Category Admin Fee, no Fee
- **When** the user saves
- **Then** `categoryId` is `__admin_fee__` and `feeMinor` is `0`
- **And** that month’s expense breakdown includes `5000` under Admin Fee
- **And** the row shows Admin Fee, not Uncategorized

### Scenario: Plan expense picker

- **Given** Add Plan on Expense
- **When** Category opens
- **Then** Admin Fee is before Uncategorized
- **And** Save persists `__admin_fee__`

### Scenario: Filter includes sentinel-only rows

- **Given** an expense with `categoryId` Admin Fee and `feeMinor` 0, and an expense with a user category plus a fee
- **When** the Activity filter is Admin Fee
- **Then** both rows are listed

### Scenario: Categories panel unchanged

- **Given** the Categories panel
- **When** expense groups render
- **Then** there is no editable Admin Fee row

## Traceability

- Vitest: `apps/web/src/lib/application/transactions.test.ts`; `apps/web/src/lib/application/plans.test.ts`; `apps/web/src/lib/domain/activity-filters.test.ts`; `apps/web/src/lib/domain/month-summary.test.ts`
- Playwright: `e2e/transfer-admin-fee.e2e.ts`
- Implementation: `resolveCategoryId`; `CategoryPicker` on QuickAdd + PlanSheet; list `categoryName` / icon; `hasAdminFeeLedgerRow` / `matchesCategories`

## Related

- 106, 174, 123
