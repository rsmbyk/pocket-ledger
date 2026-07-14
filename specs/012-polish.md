# Spec 012: Polish — edit/delete transactions & empty states

- **ID:** 012
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Make daily use less brittle: fix mistakes in the ledger, nudge empty first runs, and keep the mobile chrome clear of the home indicator.

## Scope

### In scope

- Edit an existing income/expense from Activity (and Home “Latest”)
- Delete a transaction with confirmation
- Empty-state CTAs on Home and Activity that open quick-add
- Safe-area padding for the FAB and bottom sheet footer
- Slightly denser tab labels so four tabs fit narrow phones

### Out of scope

- Edit from charts
- Transfer type
- Undo stack / soft-delete
- Bulk edit

## Domain rules

- Update reuses add validation (amount, category for type, YYYY-MM-DD date)
- Delete removes the row; balance and month summary recompute from remaining rows
- Notes remain sealed/opened via field-crypto when lock is on

## Acceptance scenarios

### Scenario: Edit updates activity and balance

- **Given** an expense of 15000 in Food
- **When** the user edits it to 10000
- **Then** Activity shows 10000 and the account balance reflects −10000

### Scenario: Delete removes the transaction

- **Given** a single expense of 15000
- **When** the user deletes it and confirms
- **Then** Activity is empty and balance is zero

### Scenario: Empty home offers add

- **Given** no transactions
- **When** the user is on Home
- **Then** an empty-state control can open the add sheet

## Traceability

- Vitest: `src/lib/application/transactions.test.ts`
- Playwright: `e2e/polish.e2e.ts`
- Implementation: `transactions.ts`, `QuickAddSheet.svelte`, `AppShell.svelte`
