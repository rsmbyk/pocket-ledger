# Plan 174: Expense admin fee

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 106, 107, 104

## What

Optional **Fee** on **Expense** (create + edit) with the same Admin Fee booking as Transfer. **No Fee on Income.** Transfer unchanged (106).

## Why

Bank or processor fees show up on expenses too. Income stays a clean inflow. Transfer already has the field and math.

## Out of this slice

- Fee on Income
- Admin Fee as a Categories-panel row or expense `categoryId`
- Separate linked expense row for the fee
- Recurring, percentage/tiered fees
- 173 type tabs (ship separately)
