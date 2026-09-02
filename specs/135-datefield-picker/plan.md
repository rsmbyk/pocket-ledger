# Plan 135: DateField picker restore

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Restore DateField so a tap/click opens the native date picker on Chromium/desktop (and still on mobile), across tx sheet, remaining DateField surfaces, and Pockets dates.

## Why

Spec 100’s opacity-0 overlay is the iOS hit target. Chromium hit-tests it but does not open the calendar unless the indicator is clicked or `showPicker()` runs in the same user gesture. Playwright `fill()` hid the failure.

## Scope

- Overlay stays (iOS)
- `showPicker()` on click/pointerup
- Stretch `::-webkit-calendar-picker-indicator`
- Modal interact-outside guard if the native popup is treated as outside

## Out of this slice

- Custom calendar library (100 option B) unless this path fails
- Header month `type="month"` chrome (141) except: if that control uses the same overlay pattern, it must open too or share the helper
