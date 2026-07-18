# Plan 068: Activity date groups + note secondary

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 063 (list rows); Spec 067 (no category sort)

## Why

Repeating the date on every Activity row is noisy when sorting by date. Group by day and use the secondary line for notes instead.

## Scope / edges

**In:** Date section headers only for Date asc/desc sorts; Activity rows use note/spacer secondary (no per-row date). Home Recent unchanged.

**Out:** Sticky pin headers; changing Recent layout.

## Approach

- Domain helper: group sorted txs by `occurredOn` when mode is date sort (pure function — TDD)
- `ActivityTable` / list renders headers + rows; `TransactionListRow` `secondary` prop
- Playwright for grouped vs flat

## TDD

- **Red Vitest** first for grouping helper (headers only for date modes; order preserved)
- **Green** domain
- **Red Playwright:** Date sort shows headers + no row dates; Default flat; note on secondary; Home Recent still shows date
- **Green** UI
