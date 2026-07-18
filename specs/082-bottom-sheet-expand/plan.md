# Plan 082: Bottom sheet expand to fit

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Bottom sheets cap at `90svh` and scroll form bodies while the viewport still has room (Close clipped).

## Approach

Grow sheet with content up to **`100svh`**; body `overflow-y-auto` only after max height. Apply to tx sheet + Activity filters/sort when bottom. Full-height → flush top radius.

## TDD

Playwright or manual: Add tx on short phone viewport — Save/Close visible without scrolling when content fits in 100svh.
