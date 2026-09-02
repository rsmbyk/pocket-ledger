# Plan 145: Remove Filters Amount compare

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Drop the Filters **Amount** row (Any / Less than / Greater than + value). Search still matches amounts (017).

## Why

The compare control is unused chrome. Note/amount search already covers finding a sum.

## Scope

- Remove UI (`activity-filter-amount-op` / `activity-filter-amount`)
- Stop `filterTransactions` amountOp/amountRaw matching
- Drop fields from criteria, session, default/badge
- Keep search digit match

## Out of this slice

- Search field; Show voided; Type/Category/Pocket; date range
