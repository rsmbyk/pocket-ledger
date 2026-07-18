# Plan 073: Normal / Transfer add; immutable type; editable transfers

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070 (two pockets for Transfer tab)

## Why

Move money between pots without fake expense/income pairs. Type stays fixed after create; transfer field values remain editable.

## Scope / edges

**In:** Add sheet tabs Normal | Transfer; Transfer when ≥2 pockets; fields source/dest/amount/note/date; create + **edit** transfer; full pickers + same-pocket warning; type badge neutral; type immutable on all txs.

**Out:** Converting transfer ↔ normal; transfer category; recurring transfers.

## Approach

- Reuse `QuickAddSheet`; use shadcn `Tabs` (`variant="line"` or default) for Normal | Transfer — not a `grid` of filled Buttons
- Transfer edit uses same controls as create (not read-only void-only view)
- `updateTransfer` (or extend update path) for amount/source/dest/note/date; refuse type change
- Remove `assertTransferNotEditable` gate

## TDD

- Transfer create/update validation; refuse type change; allow field updates
