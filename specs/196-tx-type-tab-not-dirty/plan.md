# Plan 196: Type tabs are not dirty

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Switching Income / Transfer / Expense on Add transaction trips unsaved-leave with no other edits.

## Approach

Omit `type` from `isCreateTxDirty`. Other fields still dirty.
