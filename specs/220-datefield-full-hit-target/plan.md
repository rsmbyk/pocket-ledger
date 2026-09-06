# Plan 220: DateField opens from the full chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

On Android (and other small-screen Chromium), tapping a DateField does nothing unless the tap lands on the date text. The native `type="date"` overlay shrinks to the UA text width, so the calendar icon and empty chrome are dead.

## Approach

Force the overlay to `width: 100%` (gutter when a trailing snippet exists), stretch the WebKit datetime-edit/indicator over that box, and call `showPicker()` if a tap hits the visible chrome instead of the native widget. Same overlay pattern on unused `MonthField`.
