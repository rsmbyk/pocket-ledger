# Plan 147: Categories reorder whole-row drag

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

In Categories reorder, pointer-down **anywhere on the group row** (label, padding, six-dot grip) starts the same svelte-dnd-action drag that the grip starts today.

## Why

Spec 127 kept drag-handle-only so only the 6-dot icon is the source. Ronald selected the Business & creating row and asked to drag the whole item — the row is the hit target, not a tiny handle.

## Scope

- Reorder `li` is the drag source on **Income** and **Expenses**
- 127 drop-between gap (≥ 8px) and session (125) stay
- Grip stays as a visual affordance
- Keep `ul` / `li` listitem semantics; do not break svelte-dnd-action keyboard

## Out of this slice

- Reset both kinds; Discard confirm (146)
- Hairline separators; factory catalog order
- Amount filter; Pockets DnD; view-mode cards / chip drag

## Edges

1. **Label:** Income reorder, factory Work → Business & creating → Investing & cashback. Pointer-down on the **name** “Business & creating” (not the grip), drop it above Work. Order starts Business & creating, Work, Investing & cashback; Save enabled.
2. **Grip still works:** Expenses 127 path (Food & drink by the grip between Home and Utilities) still lands between.
3. **Gap:** consecutive reorder rows stay ≥ 8px apart (127).
4. **A11y:** each group remains a listitem; svelte-dnd-action’s keyboard move still works.
5. **Shared markup:** one list treatment for both kind tabs.
