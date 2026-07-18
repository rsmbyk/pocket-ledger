# Spec 078: Pocket picker on Normal transactions

- **ID:** 078
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **Normal** income/expense Add and Edit, the user can pick which **pocket** the transaction belongs to. Default is sensible when Activity is already filtered to one pocket.

## Scope

### In scope

1. Normal create form: **Pocket** control (`data-testid="tx-pocket"`) listing all pockets in 070 order with Main icon on Main
2. Normal edit (income/expense): same control, prefilled with the transaction’s `accountId`; changing pocket and saving updates `accountId`
3. Default on create:
   - If Activity’s applied pocket filter is a specific pocket → that pocket
   - Else → Main (shell default / `isMain`)
4. Persist via existing `addTransaction` / `updateTransaction` `accountId`
5. Field placement: with the other Normal fields (after Income/Expense or before Amount — prefer **before Amount** so pocket is chosen early)

### Out of scope

- Transfer source/destination (073)
- Splitting one amount across pockets
- Hiding Pocket when only Main exists (still show)

## Domain rules

- Income/expense always have a non-null `accountId`; `counterAccountId` stays null
- Moving a tx between pockets on edit is allowed (same as updating other fields)
- Type remains immutable (073); pocket change does not change type

## Acceptance scenarios

### Scenario: Create on a non-Main pocket

- **Given** Main and Vacation pockets
- **When** the user opens Add (Normal), chooses Vacation, enters an expense, and saves
- **Then** the transaction’s `accountId` is Vacation
- **And** Vacation’s balance reflects the expense

### Scenario: Default from Activity filter

- **Given** Activity filter applied to Vacation
- **When** the user opens Add (Normal)
- **Then** Pocket is preselected to Vacation

### Scenario: Default when All

- **Given** Activity pocket filter is All
- **When** the user opens Add (Normal)
- **Then** Pocket is preselected to Main

### Scenario: Edit moves pocket

- **Given** an expense on Main
- **When** the user opens edit, changes Pocket to Vacation, and saves
- **Then** the transaction’s `accountId` is Vacation
- **And** balances update accordingly

## Traceability

- Playwright: `e2e/` create on Vacation; default from filter; edit move pocket
- Implementation: `QuickAddSheet.svelte`; AppShell passes applied pocket filter id for default seed

## Related

- 070, 071, 075, 073, 077
