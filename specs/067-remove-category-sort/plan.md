# Plan 067: Remove Categories sort

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 064 (Sort sheet)

## Why

Categories sort conflicts with date-grouped Activity UX and is being dropped.

## Scope / edges

**In:** Remove `category` sort mode from domain + Sort sheet UI + tests.

**Out:** Category filter (unchanged).

## Approach

- Domain: drop `category` from `ActivitySortMode`; remove category sort path / meta if unused
- UI: remove Categories option from sort sheet
- TDD: rewrite/remove category sort unit test; update e2e

## TDD

- **Red Vitest:** delete/fail category sort cases; assert only three modes remain
- **Green** domain + Sort sheet
- **Red/green Playwright:** Categories option absent; existing date/default sorts still work
