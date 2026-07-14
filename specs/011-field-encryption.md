# Spec 011: Field-level at-rest encryption

- **ID:** 011
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

When the optional passphrase lock is enabled, sensitive free-text fields are stored encrypted in IndexedDB so a casual dump of the database does not reveal notes and names in plaintext.

## Scope

### In scope

- AES-GCM field encryption tied to the existing passphrase lock (same passphrase / salt)
- Encrypt at rest: transaction notes, recurring notes, goal names, category names
- Decrypt into memory after unlock for normal app use
- Migrate existing plaintext → ciphertext when enabling lock
- Migrate ciphertext → plaintext when disabling lock
- Export JSON remains plaintext while the session is unlocked

### Out of scope

- Encrypting integer amounts / dates / ids (kept for balance math and indexes)
- Encrypting the whole IndexedDB file as a blob
- Recovery if the passphrase is forgotten
- Separate encryption passphrase from lock passphrase

## Domain / crypto rules

- Ciphertext prefix `enc:v1:` + base64(iv || ciphertext)
- Key = PBKDF2 → AES-GCM-256 using the lock salt; held only in memory after unlock
- Amounts, dates, and ids stay plaintext integers/strings
- Forgotten passphrase still cannot recover data

## Acceptance scenarios

### Scenario: Enabling lock seals existing notes

- **Given** a transaction note `secret lunch`
- **When** the user enables the passphrase lock
- **Then** the raw IndexedDB note value is ciphertext (`enc:v1:…`), not the plaintext

### Scenario: Unlocked UI shows plaintext

- **Given** lock enabled and a sealed note
- **When** the user unlocks with the correct passphrase
- **Then** Activity shows the original plaintext note

### Scenario: Disabling lock restores plaintext at rest

- **Given** lock enabled with sealed fields
- **When** the user disables the lock with the passphrase
- **Then** raw stored fields are plaintext again

## Traceability

- Vitest: `src/lib/application/field-crypto.test.ts`, `src/lib/application/lock.test.ts`
- Playwright: `e2e/encryption.e2e.ts` (UI still shows notes after unlock)
- Implementation: `field-crypto.ts`, lock migration hooks, write/read paths
