# Plan 150: Category rename modal

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Category rename is a dialog like the group. All four kind dialogs name Income/Expenses in the title and tint the header like a group card. Rename helpers are `Current: {name}` frozen at open; add-category helper is `In {group}`.

## Why

Inline chip rename is cramped and cannot hold a helper. Dialog titles do not say which kind you are editing.

## Out of this slice

- Stock rename; uniqueness rules; pocket rename
- Hide/show, hover pencils, long-press timing
- Toolbar “Add group” copy
