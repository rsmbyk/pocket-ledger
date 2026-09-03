# Plan 157: Settings privacy passphrase UX

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 154, 007, 120

## What

Merge the inner “This device is not encrypted” card into Privacy paragraphs. Passphrase fields get in-input check/cross icons (`text-income` / `text-destructive`) and a colored requirements list (min 8). No length/mismatch error placeholders. Enable lock waits until requirements + confirm match. Disable lock and UnlockScreen submit wait until the field is non-empty.

## Why

The nested warning card is redundant with Privacy. Users should see *which* rule failed instead of a generic error slot.

## Out of this slice

- Extra composition rules beyond min 8; Cloud Sync WebAuthn
