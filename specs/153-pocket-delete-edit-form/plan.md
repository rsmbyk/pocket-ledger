# Plan 153: Delete pocket from the edit form

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070, 149, 152

## What

Put **Delete pocket** back on the non-Main **edit** dialog (danger block above Cancel/Save). Click checks persisted state: allowed → danger confirm; blocked → popover listing every reason (no counts). List stays action-free. Main and create have no section.

## Why

149 removed list delete; 148 deferred relocating it. Users need an honest path that says *why* a pocket cannot go, including voided txs and active goals (152).

## Out of this slice

- Changing 070 tx/voided rules; list delete; deleting Main
- Goal CRUD UI (152)
