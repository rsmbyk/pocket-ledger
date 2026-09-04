# Plan 175: Reorder toolbar Default + Cancel

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 123, 146

## What

Categories reorder toolbar: **Reset** becomes **Default** (disabled when the draft is already factory order). **Discard** becomes **Cancel**. Confirm dialogs and testids stay.

## Why

Reset sounds like wipe. Default matches “back to catalog order.” Cancel matches leaving without saving, while the dirty confirm can still say Discard.

## Out of this slice

- Save label
- Confirm copy / `category-reorder-discard-confirm`
- Reset applying to one kind only
- Add-category discard dialog
