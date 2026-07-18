# Plan 088: Tabs active indicator

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 081

## Why

Default tab chrome shows muted track but no raised active pill — styles use `data-active:*` while bits-ui sets `data-state="active"`.

## Approach

Add `@custom-variant data-active` in `src/app.css` mirroring `data-open`.

## TDD

Playwright: tx-mode-tabs active trigger has `data-state="active"`.
