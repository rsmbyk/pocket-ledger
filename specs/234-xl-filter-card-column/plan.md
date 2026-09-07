# Plan 234: Xl list + filter card columns

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 049, 058, 142, 223

## What

On ≥1280, Transactions and Plans are two columns under the page header: **left** is chrome (search, Add, and the date range on Transactions) plus the list; **right** is a **filter card** that hugs its contents. Below 1280 the sheet layout stays as today.

## Why

The always-on xl filter (058) sits beside the list only. Chrome still spans the full inset above that split (142), so the filter reads as a list add-on instead of its own page section.

## Out of this slice

- Filter criteria, Apply/Clear/search semantics, xl breakpoint
- Restoring a Filters title
- Other routes
