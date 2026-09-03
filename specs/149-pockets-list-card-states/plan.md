# Plan 149: Pockets list card states

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Pockets list cards become a clean details hit target: three-column row (grip | name → description → goal | amount), hover/focus highlight, no edit/delete/clear-goal on the card, mute Main while a non-Main pocket is being dragged.

## Why

The stretched Open link already covers the card (148). Action buttons sit on that hit target. Description lives in a full-width footer (094). Main still looks movable while you drag. There is no hover, so the card does not feel clickable.

## Scope

- Remove list edit / delete / clear-goal and the list delete alert + confirm dialog
- Keep grip, Add Pocket, details toolbar Edit
- Description in the middle column (supersede 094 footer)
- Hover / focus-within highlight; mute Main during svelte-dnd-action consider→finalize

## Out of this slice

- Relocating delete / clear-goal
- Whole-row drag; Main as a drop target
- Pocket details card hover
