# Spec 220: DateField opens from the full chrome

- **ID:** 220
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

An enabled DateField opens the native date picker when the user activates **any** part of the visible field chrome (icon, padding, empty space), not only the formatted date text. Hardens Specs 100 and 135 on Android / small-screen Chromium.

## Scope

### In scope

1. Shared `DateField` overlay fills the chrome (minus the trailing-snippet gutter when present) so a tap on the icon or empty padding hits the native `type="date"` control.
2. Trailing snippet (pocket goal “Has date”) stays the hit target for its own control.
3. `MonthField` uses the same full-chrome overlay (even if unused today).
4. Surfaces inherit the fix: transaction occurred-on, Pockets opening/goal dates.

### Out of scope

- Custom / bits-ui Calendar replacement
- Activity `TransactionRangePicker` popover (already a full button)
- Date format or validation
- Sheet discard / dirty-outside beyond keeping the picker usable

## Domain rules

- None (display/storage unchanged: ISO `YYYY-MM-DD`, `DD MMM YYYY` readout)
- Disabled DateField must not open

## Acceptance scenarios

### Scenario: Tap beside the date text opens the picker

- **Given** Add or Edit transaction is open on a mobile-sized viewport
- **When** the user activates the Date field on the calendar icon or empty chrome (not only the formatted text)
- **Then** the native date picker is presented (or `showPicker` runs in that gesture)
- **And** the overlay input’s box is at least 85% of the field width and height

### Scenario: Trailing control still works

- **Given** a DateField with a trailing snippet (pocket goal “Has date”)
- **When** the user activates the trailing control
- **Then** that control receives the activation (not the date picker)

### Scenario: Disabled does not open

- **Given** DateField is disabled
- **When** the user tries to activate the chrome
- **Then** the picker does not open and the value does not change

## Traceability

- Vitest: none required (no domain rule change)
- Playwright: `e2e/date-field.e2e.ts` — overlay size vs chrome; click icon-side and far chrome; `showPicker` spy
- Implementation: `apps/web/src/lib/ui/DateField.svelte`; `apps/web/src/lib/ui/MonthField.svelte`

## Related

- 100 DateField opens on mobile
- 135 DateField picker restore
- 091 trailing snippet
