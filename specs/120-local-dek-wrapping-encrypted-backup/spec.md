# Spec 120: Always-on local DEK wrapping; encrypted local-only backup

- **ID:** 120
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Keep a random DEK in RAM after unlock, wrap or store it locally, seal rows on write, and offer encrypted file backup only while signed out.

## Scope

### In scope

1. Always-on DEK after one-time plaintext migrate
2. Passphrase off: raw DEK in IndexedDB; on: salt + wrapped DEK only
3. Set / change / unset device passphrase = re-wrap only (no row rewrite)
4. Encrypt on write; decrypt per read; no whole-table RAM load
5. Plaintext at rest: ids + non-secret settings. Ciphertext: amounts, dates, names, notes, types, void flags, pocket fields — the rest
6. No local recovery key; forgot device passphrase → this browser’s data is gone unless they already exported
7. Encrypted export envelope: version, salt, wrapped DEK, sealed rows as stored
8. Device passphrase on → prompt it for export even if already unlocked
9. Passphrase off → one-time export passphrase (≥ 8) that does **not** enable device lock
10. Import: file passphrase; full replace (Spec 003); then wrap or store raw DEK locally
11. Reject old `formatVersion: 1` plaintext JSON
12. Hidden while signed in
13. PBKDF2-SHA-256, 600,000 iterations; envelope stores `kdf` + params; AES-GCM wraps and rows
14. Optional: screensaver already drops DEK (007/011); keep that

### Out of scope

- Hex recovery kit (119)
- Cloud wrap coat-check (119/121)
- Argon2id
- Signed-in export/import
- Device lockout ladder (already 011) unless wrapping changes counters

## Domain rules

- `field-crypto` (or successor) only sees the DEK in RAM.
- Math after unlock; month views stream/decrypt (no Dexie range indexes on encrypted dates).

## Acceptance scenarios

### Scenario: Set passphrase does not rewrite rows

- **Given** a ledger already sealed with a DEK stored raw
- **When** the user sets a device passphrase
- **Then** only the wrap record changes (raw DEK removed)
- **And** existing ciphertext rows are not rewritten

### Scenario: Unset passphrase

- **Given** a wrapped DEK
- **When** they unset the device passphrase after proving it
- **Then** the DEK is stored raw again
- **And** rows are not rewritten

### Scenario: Forgot device passphrase

- **Given** they never exported
- **When** they cannot unwrap
- **Then** this origin’s ledger is unrecoverable in-app (no local kit)

### Scenario: Encrypted export with lock off

- **Given** signed out, no device passphrase
- **When** they export
- **Then** they must set a one-time file passphrase ≥ 8
- **And** device lock remains off

### Scenario: Old plaintext backup rejected

- **Given** a `formatVersion: 1` JSON file
- **When** they import
- **Then** it is rejected

### Scenario: Signed in hides backup

- **Given** a completed signed-in session (119)
- **When** they open More
- **Then** export/import are not offered

## Traceability

- Vitest: wrap/unwrap, migrate, envelope import/export reject v1, re-wrap without row mutation
- Playwright: export/import signed-out; More hides backup when signed in (if 119 present)
- Implementation: `lock.ts` / wrap settings, `field-crypto.ts`, backup module

## Related

- Specs 003, 007, 011
- 119 account wrap same envelope idea
- 121 sync blobs are already sealed rows
