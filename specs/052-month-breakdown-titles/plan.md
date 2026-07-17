# Plan 052: Month breakdown titles

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

“Income by category” / “Expenses by category” are long; with Spec 048 icons already signaling kind, shorter titles read cleaner.

## Scope / edges

**In:** Rename chart section titles to **Income** and **Expenses**.

**Out:** Chart data, order, icons, amount hide.

## Approach

- [`MonthSummary.svelte`](../../src/lib/ui/MonthSummary.svelte): change `title=` props (~Income / Expenses by category → Income / Expenses).

## TDD

- Vitest: none
- Playwright: extend `e2e/month-charts.e2e.ts` if titles are asserted; else visual/check

## Out of scope

Sum tile labels; Categories panel titles.
