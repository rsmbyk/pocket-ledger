# Plan 171: Goal bar color steps

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 072, 152, 170 (shared bar)

## What

Goal progress fill is a stepped blend: expense red at 0%, yellow at 70%, income green at 100%. Hue jumps every 10%; bar width still follows the true percent.

## Why

Bars are Ink `bg-primary`. Traffic-light fill makes how close a goal is scannable without reading the number.

## Out of this slice

- Row layout (170)
- Past goals modal
- Other progress bars / charts
