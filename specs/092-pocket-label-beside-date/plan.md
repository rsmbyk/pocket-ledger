# Plan 092: Pocket label beside date

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 077

## Why

Pocket / transfer path under the amount competes with the amount; date row is the natural place.

## Approach

Move showPocket chrome from amount column onto the date (or note) secondary row in TransactionListRow.

## TDD

Touch pockets / activity e2e that assert pocket testid placement.
