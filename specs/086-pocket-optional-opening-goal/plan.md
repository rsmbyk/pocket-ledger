# Plan 086: Optional opening + goal via checkboxes

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 071, 072

## Why

Opening/goal fields always look required; cannot tell default `0`/creation as-of from a user-set opening. Goal date needs an explicit “has date” control.

## Approach

- Persist `openingEnabled` / `goalEnabled` (Dexie bump)
- Checkboxes gate field enablement; disabled → store defaults + helper “will be set to X”
- Goal date: suffix checkbox; unchecked → `goalTargetOn = null`

## TDD

Vitest migration/normalize; Playwright create/edit with checkboxes.
