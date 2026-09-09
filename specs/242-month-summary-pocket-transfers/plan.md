# Plan 242: Pocket details Transfers bucket

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 002, 106, 110, 148

## What

Pocket details month summary ignores transfer principal, so Ending (Opening + Net) does not match the pocket’s real close. Add a Transfers bucket **only on pocket details**: a two-row In/Out chart after Expenses, and TransferNet in the footer so Ending = Opening + Net + TransferNet.

Home stays unchanged. Transfer principal cancels across pockets; fees already sit in Expenses.

## Why

A transfer is not income or an expense, but it does change one pocket’s balance. Pocket details needs that third flow without polluting cashflow tiles or the Home household total.

## Out of this slice

- Home month summary UI or math
- Transfer categories / per-pocket corridor bars
- Changing Income | Expenses | Net tiles
- Activity list, Plans
