# Spec 007: Optional passphrase lock

- **ID:** 007
- **Status:** Accepted

## Intent

Optional privacy lock: when enabled, the ledger UI requires a passphrase after load. Default remains unlocked (no encryption/lock).

## Scope

### In scope

- Settings toggle off by default
- Enable: set passphrase (min 8 chars), store salt + verifier only
- Cold start with lock enabled → unlock screen before shell
- Disable lock: require current passphrase
- Wrong passphrase shows error

### Out of scope

- Full field-level at-rest ciphertext for every IndexedDB row (follow-up)
- Biometrics / OS keychain
- Password recovery (forgotten passphrase cannot unlock)

## Domain rules

- Verifier = PBKDF2-derived key check material; never store plaintext passphrase
- Session unlock held in memory only

## Acceptance scenarios

### Scenario: Default has no lock screen

- **Given** a fresh profile
- **When** the app loads
- **Then** the main shell is reachable without a passphrase

### Scenario: Enabled lock blocks shell until unlock

- **Given** lock enabled with a passphrase
- **When** the app loads
- **Then** unlock UI is shown; after correct passphrase, shell appears

## Traceability

- Vitest: `src/lib/application/lock.test.ts`
- Playwright: `e2e/lock.e2e.ts`
- Implementation: `src/lib/application/lock.ts`, `UnlockScreen.svelte`
