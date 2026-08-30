# Plan 131: Categories group header actions

## What

Group card headers get icon-only **eye**, **edit** (custom only), **add**. Hover-only on `md+`. Below `md`, hide eye/edit; add stays. Click the **name** to rename (custom); hold the name 500ms to hide/show every chip in the group. When all chips are hidden, mute the **card**.

## Why

Plus is always visible and there is no group rename. Users need bulk hide and custom rename without crowding the header on desktop or duplicating chip chrome on phones.

## Scope

- Header order: `| eye | edit | add` with a rule left of the first visible action and between actions
- `renameCategoryGroup` use case (unique within kind)
- Bulk hide/show via existing hide/show per member
- All-hidden card visual
- Below `md`: add visible; name click = rename (custom); name hold = group visibility (inverse of 126 chips)

## Out of this slice

- Deleting groups; renaming stock
- Chip hover/tap (126 unchanged)
- Reorder-row rename

## Edges

1. Stock: no edit control; name click is a no-op; hold still toggles group visibility.
2. Empty group: eye disabled; hold no-op.
3. Mixed hidden: eye/hold hides the rest (not all-hidden yet).
4. All hidden: card muted; eye-off; next action shows all.
