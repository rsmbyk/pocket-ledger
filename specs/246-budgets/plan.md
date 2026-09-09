# Plan 246: Pocket budgets

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 148, 152, 171, 174, 223, 235, 237

## What

A **Budget** is a spending cap on one pocket. Pocket details shows a Budgets card between Plans and Goals (title, Add, empty view — no See more / history). Used vs limit uses a progress bar that is the **color mirror of goals**. Saving a transaction that would **exceed** a cap warns; **Hard limit** budgets refuse the save.

## Why

Goals track “have X.” Users also need “do not spend more than X” on a pocket, a category group, or selected expense categories — with an optional hard stop at the ledger.

## Out of this slice

- Home / Pockets-list preview
- `/budgets` page
- Income caps
- OS notifications
- Yearly period
