# Spec 014: Void transactions

- **ID:** 014
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Replace hard-delete with irreversible **void** so cancelled transactions remain visible in Activity and Home Recent for history, while no longer affecting balances or month totals.

## Scope

### In scope

- Void an income/expense from the edit sheet (replaces Delete)
- Voided rows stay in Activity and Home Recent (last 5 includes voided when they are among newest)
- Voided display: muted + struck-through amount + **Void** badge; row opens a read-only sheet
- Void is irreversible; voided transactions cannot be edited or voided again
- Balance, month income/expense/net, opening/ending, and category breakdowns **exclude** voided txs
- Export/import persist `voidedAt`; missing field on import → active (`null`)
- Category-in-use checks still count voided transactions

### Out of scope

- Undo / un-void
- Hard-delete UI
- AlertDialog component (confirm may use `window.confirm`)
- Destructive styling sweep for other buttons (spec 015)
- Activity filters (spec 017)
- Changing Home balance hero placement

## Domain rules

- `LedgerTransaction.voidedAt: string | null` — ISO timestamp when voided; `null` = active
- Void sets `voidedAt` and persists the row (no Dexie delete from UI)
- Active-only money: `balanceDelta` / `sumBalance` / `buildMonthSummary` ignore voided txs
- Attempting to update or re-void a voided tx is rejected
- Notes remain sealed/opened via field-crypto when lock is on

## Acceptance scenarios

### Scenario: Void removes money impact but keeps the row

- **Given** a single expense of 15000 Food
- **When** the user voids it and confirms
- **Then** Activity still shows the row with Void affordance and struck amount
- **And** Home balance is zero
- **And** month expense/net exclude that amount

### Scenario: Voided is read-only

- **Given** a voided transaction
- **When** the user opens it from Activity or Recent
- **Then** fields are not editable and there is no Save or Void action

### Scenario: Void cannot be undone

- **Given** a voided transaction
- **When** the user looks for restore/un-void
- **Then** no such control exists

### Scenario: Recent includes voided

- **Given** five or fewer transactions including at least one voided
- **When** Home Recent renders
- **Then** the voided row appears in the list with Void styling

## Traceability

- Vitest: `src/lib/domain/transaction-rules.test.ts`, `src/lib/domain/month-summary.test.ts`, `src/lib/application/transactions.test.ts`
- Playwright: `e2e/polish.e2e.ts` (delete → void)
- Implementation: `transaction.ts`, `transactions.ts`, `QuickAddSheet.svelte`, `ActivityTable.svelte`, `AppShellChrome.svelte`
- Supersedes hard-delete behavior in `specs/012-polish.md` when Accepted
