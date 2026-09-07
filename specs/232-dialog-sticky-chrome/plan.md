# Plan 232: Dialog height + sticky chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 013

## What

Dialogs cap below the viewport with padding. Header and footer stick; only the middle scrolls. Same cap on Plan/Tx sheets.

## Why

Plan/Tx dialogs use `max-h-[100svh]` and fill the screen. Footer Cancel/Save scroll away with the form.

## Out of this slice

- Copy, fields, dirty discard
- Sheet overlay vs rail (227)
