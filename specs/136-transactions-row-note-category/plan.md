# Plan 136: Transactions row note primary + category icon

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

On the Transactions list only, swap left-column hierarchy: note is the title; category (with catalog icon) is the muted line.

## Why

Mutation lists lead with the memo; category is supporting. The list had category first and no category icon.

## Scope

- `TransactionListRow` used from `ActivityTable` / Transactions list
- Pass category icon slug; Uncategorized / custom / transfer rules
- Home Recent stays Spec 076

## Out of this slice

- Amount format (137)
- PocketLabel align (138)
- Date groups (134)
