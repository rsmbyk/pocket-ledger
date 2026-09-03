# Spec 166: Import confirm keeps file on wrong passphrase

- **ID:** 166
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

A wrong backup-file passphrase is visible on the Import confirm. The chosen file stays pending so the user can retry without picking the file again.

## Scope

### In scope

1. **Inline error** on `import-backup-dialog`: **Incorrect passphrase** (`import-backup-pass-error`), same pattern as Reset (`resetPassError`). Dialog stays open. Typed passphrase is not cleared.
2. **Keep pending file** until restore succeeds: do not clear `pendingImportFile` or `backup-import-summary` on a failed decrypt.
3. **Retry:** after the error, a correct passphrase on the same confirm restores as today (158 / 120).
4. Error is **in the dialog**, not the Settings-panel `error` banner behind the overlay (`wrap()`).
5. Cancel / overlay / Escape: clear typed passphrase + error; **keep** pending file + summary. User can open Import again without a new pick.
6. Success: close confirm, clear passphrase, clear pending file, clear summary.

### Out of scope

- Invalid-file modal copy or when it opens (158)
- Successful-import replace behavior
- Device-lock wrong-guess ladder (119)
- Export passphrase validation
- Changing `restoreEncryptedBackup` throw text
- Import button chrome / native file display (168)

## Domain / UI rules

- `restoreEncryptedBackup` already throws `Incorrect passphrase` for a failed unwrap. Surface that string in the dialog; do not treat it as a successful confirm.
- Clear `import-backup-pass-error` when the passphrase field changes or the dialog closes.
- Pending `File` in memory is the source of truth. Native / hidden input chrome is 168.

## Acceptance scenarios

### Scenario: Wrong passphrase stays on confirm

- **Given** a valid v2 backup is chosen and Replace local data? is open
- **When** the user enters a wrong file passphrase and activates Import
- **Then** `import-backup-dialog` stays open
- **And** `import-backup-pass-error` shows **Incorrect passphrase**
- **And** the Settings-panel error banner is not used for this failure
- **And** `backup-import-summary` is still present

### Scenario: Retry with the same file

- **Given** the wrong-passphrase error is showing
- **When** the user types the correct file passphrase and activates Import
- **Then** restore succeeds as 158
- **And** the confirm closes and the summary resets

### Scenario: Cancel after a failed attempt

- **Given** the wrong-passphrase error is showing
- **When** the user Cancels
- **Then** the confirm closes
- **And** `backup-import-summary` is still shown
- **And** they can open Import again without picking a new file

## Traceability

- Vitest: none new (`backup.test.ts` already rejects a wrong file passphrase)
- Playwright: `e2e/settings.e2e.ts` — wrong pass keeps dialog + error + summary; correct retry restores
- Implementation: Import confirm in `MorePanel.svelte`; do not null pending state before `onImportFile` resolves
- Docs: PRODUCT backup import bullet if it still implies a silent fail

## Related

- 158 Settings backup (summary + confirm)
- 159 / 165 Reset in-dialog incorrect passphrase
- 164 Import danger chrome (shell only)
- 168 Import Choose file button
