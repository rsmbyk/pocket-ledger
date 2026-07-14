# Spec 003: Export & import JSON backup

- **ID:** 003
- **Status:** Accepted

## Intent

Let the user download a full JSON backup and restore from a backup file so data survives browser wipes and device changes.

## Scope

### In scope

- Export all accounts, categories, transactions, recurring rules, goals, net-worth snapshots, and settings (except raw encryption secrets) as versioned JSON
- Download as `pocket-ledger-YYYY-MM-DD.json`
- Import: replace local data with backup contents after confirmation
- Reject unknown/unsupported backup versions

### Out of scope

- Merge/partial import
- Cloud sync
- CSV/OFX

## Domain rules

- Backup `formatVersion` is `1`
- Import is full replace (destructive)
- Export never includes passphrase material (`encryption.passphrase*`, derived keys)

## Acceptance scenarios

### Scenario: Export downloads JSON

- **Given** the app has at least the default account
- **When** the user taps Export on More
- **Then** a JSON file download is triggered containing `formatVersion: 1`

### Scenario: Import restores transactions

- **Given** a valid backup file with an expense
- **When** the user imports it
- **Then** activity shows that expense and balance matches

## Traceability

- Vitest: `src/lib/application/backup.test.ts`
- Playwright: `e2e/backup.e2e.ts`
- Implementation: `src/lib/application/backup.ts`, More tab
