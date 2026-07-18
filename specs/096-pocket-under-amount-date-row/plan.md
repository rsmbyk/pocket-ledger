# Plan 096: Pocket under amount, date-aligned

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens / revises:** 092

## Why

092 moved the pocket onto the left date flex so it drifts toward the amount and reads as beside it. The pocket should sit **under the amount** (right), still on the **same horizontal band as the date**. Note stays between title and date on the left.

## Approach

In `TransactionListRow.svelte`:

1. Left column: title → optional note → date only
2. Right column: `flex-col items-end` — amount, then pocket when `showPocket`
3. Outer `items-start` so date and pocket share one band under title/amount

## TDD

Update pockets / activity e2e that assert pocket testid placement if needed.
