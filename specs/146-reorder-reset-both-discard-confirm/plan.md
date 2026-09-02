# Plan 146: Reorder Reset both kinds + Discard confirm

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Categories Reorder **Reset** factory-orders **Income and Expenses**. **Discard** warns when the session is dirty.

## Why

Reset only touched the visible tab (125), so the other kind stayed scrambled. Discard exited immediately, so a miss-click dropped both drafts.

## Scope

- Reset both drafts (factory stock then customs per kind); stay in reorder
- Discard: confirm when dirty; skip confirm when clean
- Leave Categories confirm unchanged

## Out of this slice

- Drag, search, Save, chrome
- Filters Amount (145)
