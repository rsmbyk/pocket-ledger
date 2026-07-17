# Spec 055: Confirm above transaction modal

- **ID:** 055
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When a ConfirmDialog opens on top of the transaction modal/sheet, the confirm must appear **above** the tx surface (visible and clickable), not stacked behind it.

## Scope

### In scope

1. ConfirmDialog overlay and content stack above transaction Dialog/Sheet (`z-50` peers today)
2. Applies to Void confirm and discard-unsaved confirm from the tx sheet (and any other ConfirmDialog usage over a modal)

### Out of scope

- Changing default Dialog/Sheet z-index for non-confirm surfaces
- Nested Bits dialog depth APIs beyond what ConfirmDialog needs
- Confirm danger chrome (057)

## Domain rules

- None

## Acceptance scenarios

### Scenario: Void confirm above tx sheet

- **Given** an open edit transaction sheet
- **When** the user clicks Void and the confirm opens
- **Then** `data-testid="confirm-dialog"` is visible above the transaction surface
- **And** Confirm / Cancel are clickable without dismissing the wrong layer first

### Scenario: Discard confirm above tx sheet

- **Given** an open edit sheet with unsaved changes
- **When** the discard confirm opens
- **Then** the confirm is similarly above the transaction surface

## Traceability

- Vitest: none
- Playwright: `e2e/polish.e2e.ts` and/or `e2e/tx-sheet-polish.e2e.ts`
- Implementation: `src/lib/ui/ConfirmDialog.svelte` (+ dialog overlay/content class hooks if required)

## Related

- Spec 041 (modal platform)
- Spec 015 (destructive confirms)
