# Plan 152: Multiple goals per pocket

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 071, 072, 086, 148, 149

## What

Each pocket can have many goals (dated “have X by Y” and open-ended). Details always shows a Goals card (empty or active list). Past dated goals (expired or Dropped) live in a read-only modal. No-date Drop is hidden (soft-delete). Progress is always derived from txs. Goal fields leave the pocket form.

## Why

One goal on the account row forces rewriting the target when a date hits. Users want a stack of targets, a history of past goals, and Drop instead of Clear (already gone from the list in 149).

## Out of this slice

- Pocket delete UI (153)
- List-card delete / clear-goal chrome
- Badges on the active details card
- Budgets; renaming Drop
