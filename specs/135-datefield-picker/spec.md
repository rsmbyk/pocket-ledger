# Spec 135: DateField picker restore

- **ID:** 135
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Activating an enabled DateField presents the OS/browser date picker so the user can choose a day. Hardens Spec 100 on Chromium/desktop without breaking iOS.

## Scope

### In scope

1. Keep the 100 overlay: native `type="date"` stretched over the chrome (`opacity-0`, not `sr-only`).
2. On click/pointerup of that input (user gesture), call `showPicker()`; catch `NotAllowedError` / unsupported. iOS `showPicker` may be a silent no-op; the overlay tap still opens the OS sheet.
3. Stretch `::-webkit-calendar-picker-indicator` over the input so a Chrome click hits the indicator if `showPicker` is blocked.
4. If sheets/dialogs treat the native popup as interact-outside (picker flashes then closes), `preventDefault` on focus/pointer-outside while the DateField input is the active element. Verify tx dialog, filters sheet, pocket dialog.
5. Surfaces: transaction occurred-on (Normal + Transfer), Pockets opening/goal dates, and any remaining DateField (including 141 custom range fields once they exist).

### Out of scope

- bits-ui / shadcn Calendar replacement unless Ronald switches after this path fails
- Date format or validation changes
- Changing sheet discard / dirty-outside beyond keeping the picker usable
- PocketLabel / row / filter multi-select

## Domain rules

- None (display/storage unchanged: ISO `YYYY-MM-DD`, `YY Mon DD` readout)
- Disabled DateField must not open

## Acceptance scenarios

### Scenario: Tx date opens on click

- **Given** Add or Edit transaction is open
- **When** the user activates the Date field (`tx-occurred-on` or `tx-transfer-occurred-on`)
- **Then** the native date picker is presented (or `showPicker` runs in that gesture)
- **And** choosing a date updates the field to `YY Mon DD` and the bound ISO value

### Scenario: Disabled does not open

- **Given** DateField is disabled (voided transaction view)
- **When** the user tries to activate it
- **Then** the picker does not open and the value does not change

### Scenario: Trailing control still works

- **Given** a DateField with a trailing snippet (pocket goal “Has date”)
- **When** the user activates the trailing control
- **Then** that control receives the activation (not the date picker)

### Scenario: Click path, not only fill

- **Given** Add transaction on a mobile-sized viewport
- **When** the test clicks the field chrome then sets a date
- **Then** `showPicker` was invoked on the overlay input in that gesture (spy) or the native input is the hit target
- **And** `fill()` still updates the display (existing 100 coverage)

## Traceability

- Vitest: none required
- Playwright: `e2e/date-field.e2e.ts` (click + `showPicker` spy; keep fill → `YY Mon DD`; one non-sheet surface if still present)
- Implementation: `apps/web/src/lib/ui/DateField.svelte`; sheet/dialog interact-outside only if needed
- Hardens: 100, 042, 044

## Related

- 100, 047 (toggle-close still relaxed), 141 header range
