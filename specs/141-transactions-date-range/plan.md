# Plan 141: Transactions header date range (month or custom)

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Move the date range to a centered Transactions header control with Month (default) and Custom modes. Remove From/To from the Filters sheet.

## Why

Mutations are viewed a month at a time. Filters should not hide the range; the header should.

## Scope

- Sticky header center cluster; title left
- Month vs Custom; default current month (1st through today)
- Live apply; sheet Clear does not reset
- Session mode + monthKey / start-end
- Depends on DateField open (135) for Custom (and month input if native)

## Out of this slice

- Home month summary nav
- All-time list
- Custom calendar library
