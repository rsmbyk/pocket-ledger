# Spec 001: Transactions + seed categories

- **ID:** 001
- **Status:** Accepted

## Intent

Let the user record income and expenses on the default account from a mobile quick-add sheet, see a running balance, and browse recent activity.

## Scope

### In scope

- Seed a small set of default categories on first launch (income + expense)
- Add income or expense with: amount, type, category, optional note, date (defaults to today)
- Amounts as integer minor units (IDR whole units)
- List recent transactions (newest first)
- Balance = sum of income − sum of expenses for the active account
- Enable the Add FAB and Activity tab content

### Out of scope

- Transfers between accounts
- Edit / delete transactions
- Charts / month filters
- Custom category management UI
- Recurring, goals, export

## Domain rules

- `amountMinor` is always a **positive** integer; `type` is `income` or `expense` (no `transfer` in this slice)
- Balance contribution: income → `+amountMinor`, expense → `−amountMinor`
- Reject zero or negative amounts and non-integers
- `occurredOn` is a calendar date `YYYY-MM-DD`
- Every transaction belongs to an `accountId`; `counterAccountId` stays `null`
- Categories have `kind` matching transaction type when assigned

## Acceptance scenarios

### Scenario: Seed categories exist after first open

- **Given** a first-time visitor
- **When** the app finishes starting up
- **Then** default categories are available for expense and income (e.g. Food, Transport, Salary)

### Scenario: Add an expense updates balance and activity

- **Given** the shell is ready on account Main
- **When** the user opens Add, chooses Expense, enters `15000`, picks an expense category, and saves
- **Then** the balance decreases by IDR 15,000 and the activity list shows the new expense

### Scenario: Add income increases balance

- **Given** the shell is ready
- **When** the user adds income of `100000` with an income category
- **Then** the balance increases by IDR 100,000

### Scenario: Invalid amount is rejected

- **Given** the quick-add sheet is open
- **When** the user tries to save with an empty or zero amount
- **Then** the transaction is not created and an error is shown

## Traceability

- Vitest: `src/lib/domain/transaction-rules.test.ts`, `src/lib/application/transactions.test.ts`
- Playwright: `e2e/transactions.e2e.ts`
- Implementation: `src/lib/application/transactions.ts`, `src/lib/ui/QuickAddSheet.svelte`, `src/lib/ui/AppShell.svelte`
