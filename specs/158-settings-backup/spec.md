# Spec 158: Settings backup (local-only)

- **ID:** 158
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Local-only backup lives in Settings as **Export** and **Import**. The passphrase is clearly for the **file**. Import inspects the envelope first: bad format gets a modal; good format shows counts, then a danger confirm.

## Scope

### In scope

1. **Card** — `settings-section-backup`, signed-out only. Two inner sections: **Export** and **Import**. No Reset button here (159).
2. **Export** — Keep encrypted envelope (120). Placeholder / label is **Backup file passphrase** (never `Device passphrase`). Helper: this secret wraps **this file**, not the ledger. When device lock is on, 120 still requires the **same** device passphrase to wrap — copy must say they are wrapping the file with that passphrase, not unlocking a different product. Lock off: one-time file passphrase ≥ 8; does not enable device lock. Confirm field when lock off stays.
3. **Import format check** — On file select, read as text and parse. Valid: JSON object, `formatVersion === 2`, encryption envelope fields (`kdf`, `saltB64`, `wrappedDekB64`, `iterations`), and collection arrays (`accounts`, `transactions`, `categories`, `categoryGroups`, `goals` — missing array = empty list, not invalid if other envelope is present; require the arrays to exist as arrays). `formatVersion: 1` and non-JSON / wrong shape fail.
4. **Invalid** — Modal `backup-import-invalid-dialog` (popup, not toast, not inline-only): this is not a Pocket Ledger backup (mention plaintext v1 if that was the reason). Does not open the replace confirm. File input resets.
5. **Valid** — Show a brief **summary** (`backup-import-summary`) from the envelope **without decrypting**: counts of pockets (`accounts.length`), transactions, custom categories, category groups, goals, and `exportedAt` if a string. Then **Import**. Clicking Import opens danger confirm (replaces all local data). Confirm then asks file passphrase and `restoreEncryptedBackup` as today.

### Out of scope

- Signed-in export/import (stay hidden)
- Changing KDF / envelope crypto
- Decrypting rows for names in the summary

## Domain rules

- Extract `inspectEncryptedBackup(raw: string)` (name may vary): `{ ok: true, summary }` or `{ ok: false, reason }`. Reason distinguishes v1 vs generic invalid.
- Counts use array `.length` on the JSON; sealed field strings still count as rows.
- `netWorthSnapshots` may appear; optional extra line, not required.

## Acceptance scenarios

### Scenario: Export labeling

- **Given** signed out, device lock on
- **When** Export opens
- **Then** the passphrase field is not placeholder `Device passphrase`
- **And** helper copy says the passphrase wraps the backup file

### Scenario: Invalid file modal

- **Given** signed out
- **When** the user picks a `formatVersion: 1` JSON file
- **Then** `backup-import-invalid-dialog` is visible
- **And** `import-backup-confirm` is not shown
- **When** they pick a random `.txt`
- **Then** the invalid modal is shown again

### Scenario: Valid summary then confirm

- **Given** a valid v2 encrypted backup with 2 accounts and 5 transactions
- **When** the user picks that file
- **Then** `backup-import-summary` shows 2 pockets and 5 transactions (and other counts)
- **When** they activate Import
- **Then** a danger confirm warns that local data is replaced
- **And** confirming still requires the file passphrase before restore

## Traceability

- Vitest: `apps/web/src/lib/application/backup.test.ts` — inspect v1 / bad JSON / v2 counts
- Playwright: `e2e/backup.e2e.ts` — labels, invalid modal, summary
- Implementation: `backup.ts` inspect helper; Settings Backup card; dialogs
- Docs: PRODUCT backup bullets

## Related

- 003 import replace; 120 envelope; 154 hub; 159 reset split out
