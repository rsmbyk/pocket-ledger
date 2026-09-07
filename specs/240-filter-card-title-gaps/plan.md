# Plan 240: Filter card title + even header/footer padding

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 234

## What

Xl Transactions and Plans filter cards show a **Filters** title (same icon as the sheet) and even header/footer padding.

## Why

Spec 234 left the card header as Clear-only. shadcn `[.border-b]:pb-(--card-spacing)` / `[.border-t]:pt-(--card-spacing)` also make the inner edges taller than `py-3`.

## Out of this slice

- Column layout, hug-content, no Close on xl
- Narrow filter sheet
