# Plan 163: Enable-lock check when typed

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 157

## What

New-passphrase and confirm do not show live icons or requirement coloring until that field has text.

## Why

Fail chrome on empty fields looks like an error before the user has started.

## Out of this slice

- UnlockScreen, disable-lock, backup/export passphrase fields
- New strength rules
