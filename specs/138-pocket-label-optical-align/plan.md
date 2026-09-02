# Plan 138: PocketLabel Main text optical alignment

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Optically align the pocket **name** to the Main landmark icon on list-row pocket lines and pocket picker dropdowns only.

## Why

Figtree + default line-height vs `size-3.5` icon makes “Main” sit high even with `items-center`.

## Scope

- TransactionListRow pocket line (`text-xs`)
- Tx sheet pocket picker; Transactions filter pocket picker
- Optional compact/optical flag on PocketLabel

## Out of this slice

- Pockets hub rows
- Category / Uncategorized / transfer / nav icon+text
