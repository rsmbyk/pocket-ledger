# Plan 087: Remove recurring

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Recurring is no longer wanted in the product; remove UI and live data path.

## Approach

Strip More Recurring UI and shell wiring; delete app/domain/repo/tests; Dexie stop using `recurringRules` (clear on migrate); export omits; import ignores legacy keys; update product docs.

## TDD

Remove/adjust e2e and unit tests that cover recurring; ensure backup import still succeeds with old payloads containing recurring.
