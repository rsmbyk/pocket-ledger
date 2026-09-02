# Plan 139: Filters Type / Category / Pocket multi-select

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Transactions Filters Type, Category, and Pocket become multi-select menus. Tx sheet pickers stay single-select.

## Why

Users need to include more than one type, category, or pocket without applying three times.

## Scope

- `ActivityFilterCriteria` arrays; OR within a dimension, AND across
- Trigger All / one label / N selected
- 107 Transfer-only still disables category
- Session coerce from old single fields
- Add-tx default pocket: exactly one applied pocket, else Main

## Out of this slice

- From/To (141); voided invert (140); Amount control
- Tx sheet Category/Pocket multi
