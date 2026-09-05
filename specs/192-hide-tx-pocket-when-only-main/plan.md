# Plan 192: Hide Pocket when only Main

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 187 (parked)

## Why

A read-only Main Pocket row on income/expense Add/Edit adds no choice.

## Approach

Hide the whole Pocket block when `options.length < 2`. Keep Main as the selected id. Two or more pockets stay the dropdown. Park Spec 187 so the static row can be restored later.
