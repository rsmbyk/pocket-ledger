# Plan 099: Tight amount+pocket stack, vertically centered

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Supersedes:** 098

## Why

098 pushed the pocket to the bottom of a stretched amount column when a note was present. Prefer a tight amount+pocket stack with no gap, vertically centered as one block against the left title/note/date column.

## Approach

In `TransactionListRow.svelte`: remove 098 stretch/`mt-auto`; amount column `gap-0`; outer row `items-center` when there is a secondary line.

## TDD

Visual; existing pocket testids remain.
