# Spec 214: Show money without a passphrase

- **ID:** 214
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Hide money and Show money are both one tap. Lock on or off does not matter. The passphrase dialog is gone.

## Scope

1. `toggle-home-amounts` always flips and persists `pocket-ledger-hide-amounts`
2. Remove `show-money-dialog` / `verifyPassphrase` on this path
3. Header lock and Unlock screens unchanged; hide does not drop the DEK

Supersedes Spec 089. Spec 103’s show-money autofocus scenario is gone with the dialog.

## Acceptance scenarios

### Scenario: Show with lock on

- **Given** lock enabled and amounts hidden
- **When** the user taps Show money
- **Then** amounts are visible immediately
- **And** `show-money-dialog` is not shown

### Scenario: Hide still one tap

- **Given** amounts visible
- **When** the user taps Hide money
- **Then** amounts are `••••` with no dialog

## Traceability

- Playwright: `e2e/home-amounts.e2e.ts` (replace 089 passphrase gate); drop show-money focus in `e2e/modal-focus.e2e.ts`
- Implementation: `AppShellChrome.svelte`
