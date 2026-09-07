# Plan 235: Pocket details layout

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 148, 223, 234

## What

On xl, pocket details is three equal scrolling columns (identity | month+recent | plans+goals). Below xl it stays one `max-w-3xl` column with Opening above Plans.

## Why

Plans currently sit between Balance and Opening. Wide screens have room for a dashboard instead of a long stack.

## Out of this slice

- Home columns (238)
- Card copy, money rules, Add Plan / Add Goal / Add Transaction
- Changing the xl breakpoint
