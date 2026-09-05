# Spec 192: Hide Pocket when only Main

- **ID:** 192
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On income/expense Add and Edit, if the only pocket is Main, hide the Pocket field. The transaction still uses Main. Two or more pockets keep the Spec 078 dropdown.

Supersedes Spec 187’s visible read-only row. Spec 187 is **parked** — restore that static `tx-pocket` branch in `pocketPicker` if the field should show again with one pocket.

## Scope

### In scope

`QuickAddSheet` `pocketPicker` for `tx-pocket` when `options.length < 2` (render nothing).

### Out of scope

Transfer From/To, Activity filters, voided disable chrome.

## Acceptance scenarios

### Scenario: Single pocket hides Pocket

- **Given** only Main exists
- **When** Add income/expense is open
- **Then** there is no `tx-pocket`

### Scenario: Two pockets stay a menu

- **Given** a second pocket exists
- **When** Add is open
- **Then** `tx-pocket` is a dropdown as today

## Traceability

- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `QuickAddSheet.svelte`
