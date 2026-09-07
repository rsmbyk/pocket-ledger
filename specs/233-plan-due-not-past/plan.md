# Plan 233: Plan Due not in the past

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 223, 220

## What

Create/edit Plan **Due** cannot pick a day before today. Existing past Due stays until changed. Accept **Date** unrestricted.

## Why

A new reminder should not be scheduled yesterday. Overdue Plans already in the Home window must not auto-bump.

## Out of this slice

- Transaction occurredOn
- Accept Date (late post)
