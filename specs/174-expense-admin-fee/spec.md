# Spec 174: Expense admin fee

- **ID:** 174
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Expenses may include an optional **admin fee** on the same row, using the same synthetic **Admin Fee** bucket as transfers (106). Income never has a Fee field and always persists `feeMinor: 0`. Transfer behavior is unchanged.

## Scope

### In scope

1. **UI** — Same optional Fee InputGroup (currency prefix, “Optional”, digits-only, thousand grouping) on **create + edit** for Transfer (already `tx-transfer-fee`) and Expense (`data-testid="tx-expense-fee"`). **Hide on Income** (create and edit). Blank → `0`.
2. **Persist** — `addTransaction` / `updateTransaction`: expense saves parsed `feeMinor` (same non-negative parse as transfer). Income still writes `feeMinor: 0`. Transfer unchanged.
3. **Pocket** — Expense `pocketDelta` = `-(amountMinor + feeMinor)` (voided → 0). Income still `+amountMinor` only. Opening/day-start follows `pocketDelta` (110).
4. **Month** — Expense: user category (or Uncategorized) gets **amount**; **fee** goes to Admin Fee; `expenseMinor` includes both. Prior-month expense fees reduce opening the same way transfer fees already do. Income unchanged. Transfer unchanged.
5. **List row** — Show `Fee N` when `feeMinor > 0` on transfer **or** expense. Main amount stays the principal (expense still shows `-amount`). Transfer testid suffix `-transfer-fee` stays; expense uses suffix `-fee`.
6. **Activity Admin Fee** — Sentinel matches any non-voided transfer **or** expense with `feeMinor > 0`. `hasAdminFeeLedgerRow` the same. Category picker: Admin Fee remains off Income-only; **offer it when type is All or Expense** (supersedes 107 “Expense type has no Admin Fee”). Transfer type still disables category (107). `isCategoryFilterCompatible` / `categoryShowAdminFee` allow Admin Fee when allowed kinds are `'all'` or include `'expense'`.
7. **104 draft** — Round-trip expense Fee (`expenseFeeDigits` on `TxCreateDraft`, missing → `''`). Transfer still uses `transferFeeDigits`. Switching create type to Income hides the field; draft fee is kept for when they return to Expense.
8. **Docs** — `docs/DATA_MODEL.md` / `docs/PRODUCT.md`: fee is transfer + expense; income always 0.

### Out of scope

- Fee on Income
- Admin Fee as a Categories-panel row or as a pickable `categoryId` on the expense form (fee still `__admin_fee__`)
- Separate linked expense transaction for the fee
- Recurring, percentage/tiered fees, FX
- 173 tabs

## Domain rules

- Expense `amountMinor` = category (or Uncategorized) principal; must be a positive integer (unchanged).
- Expense `feeMinor` = non-negative integer; default `0`; blank Fee input → `0`. Parse with the same non-negative digit rules as transfer Fee (reject negatives / non-integers).
- Expense `categoryId` is still the user category (or null). Fee is **not** stored as `categoryId`.
- Income rows always persist `feeMinor: 0`; domain ignores a stray fee on income if ever present.
- `pocketDelta` expense: `-(amountMinor + feeMinor)` when `accountId` matches.
- `buildMonthSummary` for an active in-month expense: add `amountMinor` to `expenseMinor` and the category/Uncategorized map; if `feeMinor > 0`, also add `feeMinor` to `expenseMinor` and the Admin Fee map.
- Admin Fee filter: `feeMinor > 0` on `type === 'transfer' || type === 'expense'` (non-voided). Type Expense + Admin Fee → expenses with fee only (type filter already excludes transfers).
- Type remains immutable (073).

## Acceptance scenarios

### Scenario: Expense with fee

- **Given** Add → Expense, amount `15000`, Fee `250`
- **When** the user saves
- **Then** the row is expense `amountMinor` `15000` `feeMinor` `250`
- **And** the pocket balance decreases by `15250`
- **And** that month’s expense total includes `15000` under the chosen category (or Uncategorized) and `250` under **Admin Fee**

### Scenario: Income has no fee

- **Given** Add → Income
- **When** the form shows
- **Then** there is no Fee field
- **And** save persists `feeMinor` `0`

### Scenario: Transfer unchanged

- **Given** Transfer with amount `10000` and Fee `250`
- **When** the user saves
- **Then** source decreases by `10250`, dest increases by `10000`, month Admin Fee includes `250` (106)

### Scenario: Blank expense fee

- **Given** Expense with amount `15000` and Fee blank
- **When** the user saves
- **Then** `feeMinor` is `0` and the pocket decreases by `15000` only

### Scenario: Activity Expense + Admin Fee

- **Given** an expense with fee and a transfer with fee
- **When** type is Expense and the user selects Admin Fee and Applies
- **Then** only non-voided expenses with `feeMinor > 0` are listed

### Scenario: List row

- **Given** a saved expense with `feeMinor` `250`
- **When** the list row renders
- **Then** a compact `Fee` line is visible under the amount

## Traceability

- Vitest: `apps/web/src/lib/domain/pocket-balance.test.ts` — expense `-(amount+fee)`
- Vitest: `apps/web/src/lib/domain/month-summary.test.ts` — expense fee in Admin Fee + `expenseMinor`; opening reduced by prior expense fees
- Vitest: `apps/web/src/lib/domain/activity-filters.test.ts` — Admin Fee matches expense fees; `hasAdminFeeLedgerRow`; Expense-type compatibility
- Vitest: `apps/web/src/lib/application/transactions.test.ts` — expense persists `feeMinor`; income writes `0`
- Vitest: `apps/web/src/lib/shared/create-form-drafts.test.ts` — `expenseFeeDigits` round-trip; missing → `''`
- Playwright: `e2e/transfer-admin-fee.e2e.ts` (or a focused expense-fee case there) — Expense Fee field; Income has none; save + list line
- Implementation: `pocket-balance.ts`, `month-summary.ts`, `activity-filters.ts`, `transactions.ts`, `create-form-drafts.ts`, `QuickAddSheet.svelte`, `TransactionListRow.svelte`, `docs/DATA_MODEL.md`, `docs/PRODUCT.md`
- Supersedes: 106 “income/expense always persist 0 / ignore fee”; 107 “Expense type has no Admin Fee”

## Related

- 106 Transfer admin fee (fee now also on expense)
- 107 / 139 filter category picker (Admin Fee on Expense type)
- 104 create-form drafts
- 110 month opening from pockets
