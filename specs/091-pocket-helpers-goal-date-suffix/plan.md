# Plan 091: Pocket helpers + goal-date suffix

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 086

## Why

Helpers sit above fields; opening copy is unformatted; goal-date “Has date” is a separate label, not a true input suffix.

## Approach

Move helpers under grids; format opening helper; DateField trailing checkbox-only for goal date.

## TDD

Playwright / DOM order asserts on pocket form helpers and goal-date checkbox placement.
