# Plan 167: Backup inner-section gap

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 154, 158

## What

Backup Export and Import are separated by the same gap as the card title and its content (`--card-spacing`).

## Why

Title ↔ content is Root `gap-(--card-spacing)` (24px). Export ↔ Import is Content `gap-4` (16px). Backup is the only Settings card with two inner sections.

## Out of this slice

- Card component defaults
- Other Settings cards
- 166 / 168 behavior
