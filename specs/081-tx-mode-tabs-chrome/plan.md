# Plan 081: Tx mode tabs default chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Normal | Transfer with `variant="line"` looks like plain labels, not tabs.

## Approach

Use shadcn Tabs `variant="default"` (muted track + raised active segment) on `tx-mode-tabs`.

## TDD

Playwright smoke: tabs still switch Normal ↔ Transfer.
