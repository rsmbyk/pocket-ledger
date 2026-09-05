# Spec 187: Read-only pocket when only Main

- **ID:** 187
- **Status:** Parked (superseded by [192](../192-hide-tx-pocket-when-only-main/spec.md))
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Supersedes Spec 078 dropdown when there is only Main. **Parked by Spec 192:** income/expense Pocket is hidden when `options.length < 2`. To bring the visible static row back, restore the read-only `tx-pocket` branch in `QuickAddSheet` `pocketPicker` (no chevron, still in the DOM).

## Scope

### In scope

`QuickAddSheet` `pocketPicker` for `tx-pocket` when `options.length < 2`.

### Out of scope

Transfer From/To, Activity filters pocket control, voided disable chrome.

## Acceptance scenarios

### Scenario: Single pocket is static

- **Given** only Main exists
- **When** Add income/expense is open
- **Then** `tx-pocket` is visible with Main
- **And** clicking it does not open `${testid}-option-*`

### Scenario: Two pockets stay a menu

- **Given** a second pocket exists
- **When** Add is open
- **Then** `tx-pocket` is a dropdown as today

## Traceability

- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `QuickAddSheet.svelte`
