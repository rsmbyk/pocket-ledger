# Spec 187: Read-only pocket when only Main

- **ID:** 187
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On income/expense Add and Edit, if the only pocket is Main, Pocket stays visible but read-only (no chevron, not a menu). Two or more pockets keep the Spec 078 dropdown.

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
