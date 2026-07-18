# Plan 097: Pocket row center when no goal

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 093

## Why

Without a goal, the pocket card still uses `items-stretch` and a tall end column (balance + bottom actions). The name and drag handle sit high relative to that column instead of sharing one vertical center.

## Approach

In `PocketsPanel.svelte` `pocketRow`:

- When `!hasGoal`: row `items-center`; right column drops stretch / `justify-between` / `mt-auto`
- When `hasGoal`: keep 093 stretch layout (progress under name, actions at bottom)

## TDD

Visual check; optional Playwright with a pocket that has no goal.
