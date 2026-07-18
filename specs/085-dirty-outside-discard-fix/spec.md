# Spec 085: Dirty outside discard fix

- **ID:** 085
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Hardens Spec **080**: tapping the **overlay** (outside the panel) while the tx sheet/dialog is **dirty** must **prevent close** and **show discard confirm**.

## Scope

### In scope

1. Dirty + outside/overlay → host stays open + discard ConfirmDialog visible
2. Cancel discard → host still open with unsaved values
3. Confirm discard → host closes cleanly
4. Escape + Close remain prevent-then-warn when dirty
5. Dialog and Sheet (desktop/mobile) both covered

### Out of scope

- Changing discard copy
- Pocket/category forms without discard (unless already wired)

## Domain rules

- None (UI). Root cause: bits-ui `ignore` skips `onInteractOutside`.

## Acceptance scenarios

### Scenario: Overlay shows discard

- **Given** dirty Add or Edit transaction (sheet or dialog)
- **When** the user activates the overlay / outside the panel
- **Then** discard confirm is visible
- **And** the tx sheet/dialog remains open

### Scenario: Cancel keeps editing

- **Given** discard open from outside
- **When** the user cancels
- **Then** discard closes and the tx form stays open dirty

## Traceability

- Playwright: dirty overlay → `tx-discard-confirm` + `tx-sheet` or `tx-dialog` present
- Implementation: `QuickAddSheet.svelte` (+ overlay hook if needed)
- Hardens: 080

## Related

- 044, 080
