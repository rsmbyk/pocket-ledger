# Plan 223: Plans (one-shot)

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 014, 032, 058, 087, 121, 134, 152, 177, 184, 192, 204

## What

A **Plan** is money that might happen. It is not a ledger row until accept-mode Save. Home shows a 1-week notice card. Pocket details lists that pocket’s Plans. `/plans` is a Transactions-like page (search + type/pocket filters, no date range). One modal: edit vs accept. Repeat stays **Once** until 224.

## Why

A future `occurredOn` already hits balances. Old Recurring (004) auto-posted; 087 removed it and parked a reminder replacement. This is that replacement: the due date is a question.

## Out of this slice

- Weekly / Monthly, advance `dueOn`, Save for next (224)
- Form Close → Cancel on existing hosts (225)
- Sidebar icon rail (226)
- OS push, auto-post, Past list, Pause, yearly
