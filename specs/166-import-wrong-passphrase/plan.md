# Plan 166: Import confirm keeps file on wrong passphrase

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 158, 164

## What

Wrong backup-file passphrase stays on the Replace-local-data confirm with an inline error. The chosen file and summary stay until restore actually succeeds.

## Why

The confirm handler nulls `pendingImportFile` / `importSummary` before `restoreEncryptedBackup`. A wrong passphrase throws; `wrap()` paints that on the Settings panel behind the still-open dialog.

## Out of this slice

- Invalid-file modal (158)
- Import button chrome (168)
- Device-lock wrong-guess ladder
- Export passphrase errors
