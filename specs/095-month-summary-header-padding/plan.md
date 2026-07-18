# Plan 095: Month summary header padding

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Month summary `Card.Header` looks vertically uneven — bottom padding should match top.

## Approach

Equalize vertical padding on MonthSummary header (`pt`/`pb` same); neutralize any Card.Header default that pads bottom differently (e.g. `[.border-b]:pb-(--card-spacing)`).

## TDD

Visual; optional assert class/padding if useful.
