# Spec 232: Dialog height + sticky chrome

- **ID:** 232
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Centered dialogs never fill the viewport. Header and footer stay on screen; fields scroll. Plan/Tx bottom sheets use the same height cap.

## Scope

### In scope

1. Every `Dialog.Content`: max height `calc(100svh - 2rem)` (≈1rem inset each side), never `100svh`. Short dialogs hug content.
2. Header (`data-slot=dialog-header`) and footer (Cancel/Save row) stay visible. Middle scrolls.
3. Plan/Tx: Drop/Skip in the scroll body; Cancel | Save | Save for next in the sticky footer. Same for Add Transaction.
4. Plan/Tx bottom sheets: same max-height inset + sticky header/footer.
5. Confirm/command: inherit the cap; extra sticky only if they overflow.

### Out of scope

- Field set, copy, discard confirms
- Changing overlay/backdrop look

## Domain / UI rules

- Cap is a **maximum**; short confirms do not stretch to it.
- Footer is the Cancel/Save (and Save for next) row, not Drop/Skip.

## Acceptance scenarios

### Scenario: Tall plan dialog

- **Given** desktop Edit plan with enough fields to overflow
- **When** the dialog is open
- **Then** `plan-dialog` height is less than the viewport
- **And** the header title stays visible
- **And** `plan-save` stays visible
- **And** scrolling the form does not move header or footer

### Scenario: Short confirm

- **Given** a ConfirmDialog (e.g. Drop plan)
- **When** it opens
- **Then** it is shorter than the viewport cap
- **And** it does not stretch to the max height

### Scenario: Tx dialog matches

- **Given** desktop Add transaction
- **When** the dialog is open
- **Then** header and `tx-save` stay on screen while the form body scrolls

## Traceability

- Vitest: none required
- Playwright: `e2e/plans.e2e.ts` and/or `e2e/pockets.e2e.ts` — dialog height &lt; viewport; header + save visible while scrolling
- Implementation: `dialog-content.svelte` default cap; PlanSheet / QuickAddSheet split footer; sheets same cap

## Related

- 013, 223, 225
