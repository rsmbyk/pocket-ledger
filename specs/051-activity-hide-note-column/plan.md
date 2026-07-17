# Plan 051: Hide Activity Note column

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Activity list shows a Note column that adds clutter; notes stay available on the transaction form and via search.

## Scope / edges

**In:** Remove Note column header and cells from Activity table only.

**Out:** Note field on add/edit form; search-by-note; Home Recent note display; encryption of notes.

## Approach

- [`ActivityTable.svelte`](../../src/lib/ui/ActivityTable.svelte): drop Note `Table.Head` / `Table.Cell`.
- Update e2e that assert note text in `activity-list` (notably `e2e/encryption.e2e.ts`).

## TDD

- Vitest: none
- Playwright: adjust `e2e/encryption.e2e.ts`; assert no Note column header in activity list

## Out of scope

Changing note storage or search behavior.
