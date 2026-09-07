# Plan 237: Pick Admin Fee on expense Category

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 106, 174, 123

## What

Expense Category on the tx sheet and Plan sheet offers **Admin Fee** before Uncategorized. Saving stores `__admin_fee__` so the amount lands in that bucket.

## Why

Admin Fee was only a fee sidecar (106 / 174). A standalone bank/ATM charge had no way to use the system bucket.

## Out of this slice

- Income picker, Categories panel row
- Filter chrome (already has Admin Fee); only match/has-row must include sentinel `categoryId`
- Fee field on expense/transfer
