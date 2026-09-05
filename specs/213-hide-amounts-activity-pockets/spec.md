# Spec 213: Hide amounts on Activity and Pockets list

- **ID:** 213
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The header hide-money eye works on Home, Activity, and the Pockets list. One preference masks money on all of those surfaces.

## Scope

1. Show `toggle-home-amounts` on `home`, `transactions`, and `pockets` (list and details)
2. Activity rows use `TransactionListRow.hideAmount` (`••••`, muted, no fee)
3. Pockets list masks the row balance and goal money (`GoalProgressChrome`)
4. Same `localStorage` key as 048

Show without passphrase is Spec 214. Forms, Settings, and Categories are out of scope.

## Acceptance scenarios

### Scenario: Eye on Activity and Pockets

- **Given** the app shell
- **When** the user is on Activity or the Pockets list
- **Then** `toggle-home-amounts` is visible

### Scenario: Hide on Home masks lists

- **Given** a transaction and a pocket with a non-zero balance
- **When** amounts are hidden
- **Then** Activity row amounts and Pockets list balances show `••••`
- **And** Home still shows `••••`

## Traceability

- Playwright: `e2e/home-amounts.e2e.ts`
- Implementation: `AppShellChrome.svelte`, `ActivityTable.svelte`, `PocketsPanel.svelte`
