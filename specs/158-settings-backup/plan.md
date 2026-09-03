# Plan 158: Settings backup (local-only)

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 154, 120

## What

Backup is Export + Import sections only (Reset is 159). Export copy is **file** passphrase, not “Device passphrase”. Import: format-check first → modal if invalid; else summary (counts, no decrypt) then Import + danger confirm.

## Why

“Device passphrase” sounds like ledger lock. Invalid files should fail before a replace confirm. Users should see what they are about to load.

## Out of this slice

- Signed-in backup; changing 120 crypto
