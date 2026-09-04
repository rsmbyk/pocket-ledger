# Plan 187: Read-only pocket when only Main

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 078

## Why

Add/Edit income and expense still show a Pocket dropdown with a chevron when the only pocket is Main. Transfer is already hidden with one pocket.

## Approach

If `accounts.length < 2`, render Pocket as a static full-contrast row (no menu, no chevron). Keep `data-testid="tx-pocket"`.
