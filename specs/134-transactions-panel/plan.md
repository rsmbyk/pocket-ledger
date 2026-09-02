# Plan 134: Transactions panel (rename + mutations list)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Rename the Activity hub to **Transactions**, move the path to `/transactions` (redirect `/activity`), lock the list to bank-statement grouping (date desc, createdAt desc within each day), and drop the Sort control so only Filters remain.

## Why

The list should read like account mutations: one name, always grouped by occurred-on date (latest first), newest created first inside a day. Sort is unused once that order is fixed.

## Scope

- Nav, page title, command palette, See more copy
- Route id `transactions`; `/activity` replace-navigates to `/transactions`
- Fixed sort + always date headers; whole-day chunked reveal
- Remove Sort button/sheet; session stops storing sort
- PRODUCT / ARCHITECTURE path list

## Out of this slice

- Row left-column hierarchy (136)
- Signed amount format (137)
- Filter criteria changes (139–141)
- Home Recent layout
- DateField picker (135)
