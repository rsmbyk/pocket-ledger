# Plan 172: Amount field caret stays put

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 105, 037

## What

After thousand grouping updates, the caret stays on the same digit in grouped amount fields (goal Target, pocket opening, tx Amount, transfer amount/fee).

## Why

Controlled `formatAmountDigitsDisplay` rewrites the input on every keystroke. The browser then parks the caret at the end, so deleting the first digit or typing in the middle feels broken.

## Out of this slice

- Locale-aware separators
- A shared Amount Input component (105 deferred that)
- Filter amount field
