# Spec 107: Admin Fee selectable for expense transactions

- **ID:** 107
- **Status:** Cancelled — Ronald cancelled; Admin Fee stays transfer-fee-only (Spec 106)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Allow creating and editing **normal expense** transactions under the system category **Admin Fee** (same synthetic bucket as Spec 106 transfer fees). Charts and the Activity filter keep one Admin Fee total that merges transfer fees and Admin Fee expenses. Admin Fee remains non-editable in the Categories panel (not a Dexie user category).

## Scope

### In scope

1. Normal add/edit **expense** category picker offers **Admin Fee** as a system option (marker like Uncategorized), ordered **after** user expense categories and **before** Uncategorized
2. Saving with Admin Fee selected stores `categoryId = '__admin_fee__'` (`ADMIN_FEE_CATEGORY_ID`); `feeMinor` stays `0`
3. List rows for those expenses show Admin Fee with the system marker (not a plain label)
4. Activity filter **Admin Fee** shows non-voided rows that are either:
   - expenses with `categoryId === ADMIN_FEE_CATEGORY_ID`, or
   - transfers with `feeMinor > 0`
5. Month expense breakdown merges transfer fees and Admin Fee expenses into one **Admin Fee** bucket (order still before Uncategorized)
6. Categories panel still has **no** Admin Fee row (cannot rename / delete / reorder)
7. Income category picker does **not** offer Admin Fee
8. Docs: PRODUCT notes Admin Fee is selectable for expenses
9. **Supersedes** Spec 106 scenarios / e2e that required the Normal picker to exclude Admin Fee

### Out of scope

- Seeding a Dexie `categories` row for Admin Fee
- Allowing rename/delete of Admin Fee
- Income categorized as Admin Fee
- Changing transfer fee field / `feeMinor` rules (106)

## Domain rules

- `ADMIN_FEE_CATEGORY_ID = '__admin_fee__'`; label **Admin Fee** (106)
- Expense create/update may set `categoryId` to that sentinel; validation must accept it without a Dexie category row
- User category ids never equal the sentinel; creating a user category named “Admin Fee” remains allowed as a distinct normal category (do not merge by name — same spirit as 027 Uncategorized)
- Activity filter Admin Fee = union of Admin Fee expenses and fee-bearing transfers (hideVoided still applies)
- Month summary: expense rows with `categoryId === ADMIN_FEE_CATEGORY_ID` already fall into the Admin Fee key; keep transfer-fee aggregation on the same key
- Categories CRUD ignores the sentinel (not listed, not deletable)

## Acceptance scenarios

### Scenario: Create expense as Admin Fee

- **Given** Normal expense add
- **When** the user selects Admin Fee and saves amount `5000`
- **Then** the row has `type: expense`, `categoryId: '__admin_fee__'`, `feeMinor: 0`
- **And** lists show Admin Fee with the system marker
- **And** that month’s expense breakdown includes `5000` under Admin Fee

### Scenario: Picker order

- **Given** expense categories Food then Bills in Categories order
- **When** the expense category dropdown opens
- **Then** options are Food, Bills, **Admin Fee** (system marker), **Uncategorized** (system marker)

### Scenario: Filter unions expenses and transfer fees

- **Given** an Admin Fee expense and a transfer with `feeMinor > 0`
- **When** the user filters Activity by Admin Fee
- **Then** both rows appear

### Scenario: Chart merges

- **Given** transfer fee `250` and Admin Fee expense `100` in the same month
- **When** the month expense chart renders
- **Then** one Admin Fee bar totals `350`

### Scenario: Categories panel unchanged

- **Given** the Categories panel
- **When** expense categories list renders
- **Then** there is no Admin Fee row to edit or delete

### Scenario: Income has no Admin Fee

- **Given** Normal income add
- **When** the category dropdown opens
- **Then** Admin Fee is not offered

### Scenario: Edit to / from Admin Fee

- **Given** an expense on Food
- **When** the user edits category to Admin Fee and saves
- **Then** `categoryId` is `'__admin_fee__'`
- **And** changing back to Uncategorized sets `categoryId` null

## Traceability

- Vitest: `transactions` app accept Admin Fee sentinel; `activity-filters` union; `month-summary` merge; reject Admin Fee on income path if applicable
- Playwright: `e2e/admin-fee-expense.e2e.ts` (and update `e2e/transfer-admin-fee.e2e.ts` picker exclusion)
- Implementation: `transactions.ts` resolveCategoryId; `QuickAddSheet.svelte` expense options; `TransactionListRow` / chrome labels; `activity-filters.ts`; `docs/PRODUCT.md`

## Related

- Spec 106 (transfer fees → Admin Fee bucket) — picker exclusion superseded
- Spec 027, 043 (system Uncategorized option + order)
