# Plan 169: Confirm passphrase icon only

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 157, 163

## What

Confirm passphrase live-check is the trailing icon only. Drop the **Passphrases match** helper line.

## Why

The suffix check / cross already shows match vs mismatch. The line is redundant.

## Out of this slice

- **At least 8 characters** under new passphrase
- Disable-lock / UnlockScreen / backup export fields
