# Spec 100: DateField opens on mobile

- **ID:** 100
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Tapping a DateField must open the native date picker on mobile (and desktop), including inside the Add/Edit transaction sheet.

## Scope

### In scope

1. Fix shared `DateField` so a user activation on the visible field opens the OS/browser date picker when the control is enabled
2. Keep visible value as `YY Mon DD` via `formatOccurredOnDisplay`; storage remains ISO `YYYY-MM-DD`
3. Keep optional trailing snippet clickable and not blocked by the date hit target
4. Surfaces that use DateField inherit the fix: transaction occurred-on (Normal + Transfer), Activity filter From/To, Pockets opening/goal dates
5. Soften Spec **047** DateField toggle-close: second activation may leave picker behavior to the OS; do not require in-app close-on-second-click if it conflicts with a reliable open path

### Out of scope

- Custom / bits-ui Calendar replacement (unless Ronald switches approach to plan option B)
- Date format or validation rule changes
- Sheet dismiss / dirty-outside behavior (044 / 085) beyond ensuring opening the date picker does not break the field itself

## Domain rules

- None new (display/storage unchanged)

## Acceptance scenarios

### Scenario: Tx date opens on mobile viewport

- **Given** Add or Edit transaction is open on a mobile-sized viewport
- **When** the user activates the Date field (`tx-occurred-on` or `tx-transfer-occurred-on`)
- **Then** the native date picker UI is presented (or the underlying `type="date"` control receives the activation such that a date can be chosen)
- **And** choosing a date updates the field display to `YY Mon DD` and the bound ISO value

### Scenario: Disabled does not open

- **Given** DateField is disabled (e.g. voided transaction view)
- **When** the user tries to activate it
- **Then** the date picker does not open and the value does not change

### Scenario: Trailing control still works

- **Given** a DateField with a trailing snippet (pocket goal date “Has date”)
- **When** the user activates the trailing control
- **Then** that control receives the activation (not the date picker)

### Scenario: Desktop still picks a date

- **Given** Add transaction on a desktop-sized viewport
- **When** the user activates Date and selects a day
- **Then** the field shows the new `YY Mon DD` value

## Traceability

- Vitest: none required (no domain rule change)
- Playwright: `e2e/date-field.e2e.ts` (mobile viewport open/select smoke on tx sheet; trailing not required if covered elsewhere)
- Implementation: `src/lib/ui/DateField.svelte` (call sites unchanged unless markup needs a test hook)
- Hardens: 042, 044; relaxes 047 toggle-close acceptance

## Related

- 042 DateField introduction
- 047 toggle-close (partially superseded for open reliability)
- 091 trailing snippet
