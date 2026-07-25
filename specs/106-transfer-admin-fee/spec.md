# Spec 106: Transfer admin fee

- **ID:** 106
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Transfers may include an optional **admin fee** on the same row. The user enters **amount sent** plus optional **Fee**. The source pocket loses amount + fee; the destination receives the amount. The fee counts as an expense under a synthetic system category **Admin Fee** (like Uncategorized — not a Dexie category row), ordered **before** Uncategorized in expense breakdowns and filters.

## Scope

### In scope

1. Persist `feeMinor` on every `LedgerTransaction` (transfers use it; income/expense store `0`)
2. Transfer form: **Amount** (sent) + optional **Fee** field (same amount chrome as Amount — currency prefix, digits-only, thousand grouping); blank Fee → `0`
3. Balance: source `−(amountMinor + feeMinor)`, dest `+amountMinor`
4. Month expense totals and expense-by-category include transfer fees under **Admin Fee** (sentinel `__admin_fee__`)
5. Prior-month transfer fees reduce month `openingMinor` (fees leave the ledger)
6. Expense breakdown / Activity category filter order: user categories by `sortOrder`, then **Admin Fee** (if present / as filter option), then **Uncategorized**
7. System marker treatment for Admin Fee in charts and filter (parallel to Uncategorized marker)
8. Activity filter **Admin Fee** shows only non-voided transfers with `feeMinor > 0`
9. List row: single Transfer row; when `feeMinor > 0`, show a compact Fee line (e.g. `Fee 250`) under the amount / transfer chrome (`data-testid` includes `transfer-fee`)
10. Edit transfer: Fee editable with amount/source/dest/date/note; void clears amount and fee effects
11. Create-form draft (104): Transfer draft round-trips Fee
12. Backup/restore and live reads: missing `feeMinor` → `0` (no Dexie version bump required)
13. Docs: PRODUCT + DATA_MODEL mention `feeMinor` and Admin Fee bucket

### Out of scope

- Separate linked expense transaction for the fee
- Admin Fee as a Categories-panel row (rename/delete/reorder)
- Offering Admin Fee in the normal income/expense category picker
- Percentage / tiered fees, FX, multi-currency
- Splitting one amount across multiple destinations (078)
- Changing transfer type immutability (073)

## Domain rules

- `amountMinor` = amount sent = amount received by destination; must be positive integer (unchanged from 073)
- `feeMinor` = non-negative integer minor units; default `0`; blank Fee input → `0`
- `categoryId` remains `null` for transfers; fee is **not** stored as `categoryId`
- Sentinel `ADMIN_FEE_CATEGORY_ID = '__admin_fee__'` (parallel to `UNCATEGORIZED_FILTER`); label **Admin Fee**
- Income/expense rows always persist `feeMinor: 0`; domain ignores fee on non-transfer types for balance and month math
- `pocketDelta` for transfer: source `-(amountMinor + feeMinor)`, dest `+amountMinor`
- `buildMonthSummary`:
  - Active transfer `feeMinor > 0` in month → add to `expenseMinor` and `expenseByCategory` under Admin Fee
  - Active transfer fees before month start → subtract from `openingMinor`
  - Transfers still contribute `0` to income/expense for the principal (only the fee is expense)
- Sort expense categories: real `sortOrder` ascending, then Admin Fee, then Uncategorized (`categoryId` null / key `''`) last
- Parse Fee with non-negative digit rules (blank/`0` OK); reject negatives and non-integers
- Type remains immutable (073)

## Acceptance scenarios

### Scenario: Transfer with fee

- **Given** Main and Vacation pockets
- **When** the user saves a Transfer Main → Vacation with amount `10000` and Fee `250`
- **Then** a transfer row exists with `amountMinor` `10000` and `feeMinor` `250`
- **And** Main balance decreases by `10250` and Vacation increases by `10000`
- **And** that month’s expense total includes `250` under **Admin Fee**

### Scenario: Blank fee is 1:1

- **Given** Transfer mode with amount `10000` and Fee blank
- **When** the user saves
- **Then** `feeMinor` is `0`
- **And** source decreases and dest increases by `10000` only
- **And** Admin Fee does not appear in that month’s expense breakdown (unless other fees exist)

### Scenario: Edit fee

- **Given** an existing transfer Main → BCA with fee `250`
- **When** the user edits Fee to `100` and saves
- **Then** balances reflect source `−(amount + 100)` and dest `+amount`
- **And** month Admin Fee total uses `100` instead of `250`

### Scenario: Void clears fee

- **Given** a transfer with `feeMinor > 0` in the current month
- **When** the user voids it
- **Then** pocket balances no longer include amount or fee
- **And** month expense / Admin Fee no longer include that fee

### Scenario: Expense order Admin Fee before Uncategorized

- **Given** expenses in Food, an uncategorized expense, and a transfer fee in the same month
- **When** the month expense breakdown renders
- **Then** order is Food (and any other user categories by sortOrder), then **Admin Fee**, then **Uncategorized**

### Scenario: Activity filter Admin Fee

- **Given** mixed transfers (some with fee, some without) and normal expenses
- **When** the user selects **Admin Fee** in the Activity category filter
- **Then** only non-voided transfers with `feeMinor > 0` are shown

### Scenario: List row shows fee

- **Given** a transfer with `feeMinor` `250`
- **When** it appears in Activity / Recent
- **Then** a compact Fee indicator is visible (testid containing `transfer-fee`)
- **And** a transfer with `feeMinor` `0` does not show that indicator

### Scenario: Fee field chrome

- **Given** Transfer mode in Add/Edit
- **When** the Fee field renders
- **Then** it uses the same currency prefix + digits-only + thousand grouping as Amount
- **And** Save remains enabled when Fee is blank (treated as `0`) provided amount and pockets are valid

### Scenario: Categories panel has no Admin Fee row

- **Given** the Categories panel
- **When** expense categories list renders
- **Then** there is no editable Admin Fee category row

### Scenario: Normal category picker has no Admin Fee

- **Given** Normal income/expense add with category dropdown
- **When** options render
- **Then** Admin Fee is not offered as a selectable category

### Scenario: Legacy / restore without feeMinor

- **Given** a backup or IndexedDB row missing `feeMinor`
- **When** the app reads or restores it
- **Then** the effective fee is `0` (1:1 transfer behavior)

### Scenario: Create draft round-trips Fee

- **Given** Transfer create with Fee filled, then Save draft on discard
- **When** the user opens Add Transfer again
- **Then** Fee restores and the form is dirty

## Traceability

- Vitest: `src/lib/domain/transfer-rules.test.ts`; `src/lib/domain/pocket-balance.test.ts`; `src/lib/domain/month-summary.test.ts`; `src/lib/domain/activity-filters.test.ts`; `src/lib/application/transactions.test.ts`; backup/normalize path covering missing `feeMinor`; `src/lib/shared/create-form-drafts.test.ts`
- Playwright: `e2e/pockets.e2e.ts` and/or `e2e/transfer-admin-fee.e2e.ts` — create with fee; blank fee; edit; void; Admin Fee filter; chart order; row fee chrome
- Implementation: `transaction.ts`; `transfer-rules.ts`; `pocket-balance.ts`; `month-summary.ts`; `activity-filters.ts`; `transactions.ts` (app); backup/restore normalize; `QuickAddSheet.svelte`; `TransactionListRow.svelte`; chart + filter UI; `create-form-drafts.ts`; `docs/PRODUCT.md`; `docs/DATA_MODEL.md`

## Related

- Spec 073 (transfers)
- Spec 071 (pocket balance)
- Spec 027, 043 (Uncategorized system bucket + order)
- Spec 002 (month charts)
- Spec 104 (create-form drafts)
