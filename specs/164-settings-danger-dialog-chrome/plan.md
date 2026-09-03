# Plan 164: Settings danger dialog chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 057, 158, 159

## What

Import and Reset custom Dialogs use the same flush 057 danger chrome as ConfirmDialog (`p-0` shell, edge-to-edge header, no default Close).

## Why

Those dialogs copied the tinted header into a padded `p-6 gap-6` shell, so the bar sits inset and gaps stack.

## Out of this slice

- ConfirmDialog itself
- Keep-settings helper copy (165)
- Import/reset behavior
