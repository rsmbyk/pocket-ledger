# Plan 127: Categories reorder drop-between

## What

Make group reorder accept a drop **between** two neighbors. Rows must not glue together so the dragged group cannot find a slot.

## Why

The reorder list is a flush `divide-y` stack. svelte-dnd-action picks the drop index from each row’s midpoint, and Svelte `flip` plus the zone’s own flip animate neighbors as one block. Users see several groups stick and cannot park the dragged row between them.

## Scope

- Visible gap between reorder rows (same idea as Pockets `space-y-3`)
- Drag-handle-only stays; dual-kind session / Save / Discard / Reset stay 125
- Tune zone options only if gap is not enough (drop style, drop the extra `animate:flip`)

## Out of this slice

- 126 header / tabs / tap-to-hide / long-press
- Category (chip) DnD; group rename/delete
- Reset of both kinds; auto-save on tab switch

## Edges

1. **Target:** factory Expenses Home → Utilities → Food & drink. Drag Food & drink into the slot between Home and Utilities. After the drag (before Save is fine), order is Home, Food & drink, Utilities.
2. **Neighbors:** Home and Utilities are no longer adjacent.
3. **Handle:** still the grip; dragging the label is not required.
4. **Session:** dirty after a successful between-drop; Discard still restores the 125 snapshot.
5. **Both kinds:** same list treatment on Income and Expenses (one Playwright kind is enough if the markup is shared).
