# Plan 225: Form Close → Cancel

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 177, 143, 045, 184

## What

Visible **form dismiss** buttons labeled **Close** become **Cancel** (tx sheet, range picker, Activity filters sheet). ConfirmDialog Cancel / Discard / Void / Drop stay. Chrome X stays sr-only Close. Unsaved-leave Cancel still means keep editing.

## Why

Plans (223) footers say Cancel. Tx sheet still says Close. One dismiss verb on forms.

## Out of this slice

- Renaming ConfirmDialog actions
- Sidebar “Close menu”
- Plans modal (already Cancel in 223)
