# Plan 098: Pocket bottom-aligned when note present

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 096

## Why

With a note, the left column is title → note → date, but the pocket sits immediately under the amount and lines up with the note instead of the date.

## Approach

When `secondary === 'date' && note && showPocket`, stretch the amount column and push pocket chrome to the bottom (`self-stretch` + `mt-auto` / `justify-between`) so pocket shares the date band while remaining under the amount.

Without a note, keep the tight amount → pocket stack.

## TDD

Visual / optional Playwright with a dated row that has both note and pocket.
