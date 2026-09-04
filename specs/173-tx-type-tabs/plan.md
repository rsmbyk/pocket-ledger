# Plan 173: Tx type chrome is always tabs

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 039, 073, 081

## What

Create Add-transaction uses one tab list — **Income | Transfer | Expense** — instead of Normal/Transfer above Income/Expense buttons. Edit and voided use the same tab chrome with **only the locked type**.

## Why

Two rows of type chrome is noisy. A single tab list matches how people pick a kind. Edit should look like the same control, not a separate pill badge, while type stays immutable.

## Out of this slice

- Changing type on edit (073)
- Transfer field set / fee math (106, 174)
- 104 draft `mode: 'normal' | 'transfer'`
- 172 amount caret
- 177 footer row
