# Spec 185: Account recovery after failed unlocks

- **ID:** 185
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Normal account Unlock is passphrase only. After 3 wrong guesses the existing cooldown still applies; hide the passphrase field and show remaining wait. Recovery is a full-screen page, offered after those 3 fails, and stays until the old passphrase works or a kit reset plus new passphrase completes. After a successful kit the cloud passphrase wrap is null (recovery wrap kept) so the ledger stays blocked until a new passphrase, even across reload.

## Scope

### In scope

1. Hide `hex-unlock-form` on normal account Unlock.
2. Cooldown: hide passphrase + Unlock; show remaining wait (tick); recovery control still available.
3. Full-screen recovery page (kit paste). Persist offered / pending-reset in Dexie.
4. After kit OK: clear passphrase wrap to SQL NULL, keep `recovery_wrap`, bump `wrap_rev`.
5. Device Unlock: no hex; cooldown hide-form + timer still apply.

### Out of scope

- Un-parking PRODUCT cloud lockout + email
- New hex kit after this reset
- Changing rung durations
- Device hex

## Domain / UI rules

- Recovery offered: set on the 3rd consecutive **account** wrong. Cleared on correct old passphrase or after new passphrase post-kit.
- Pending passphrase reset: set after kit unwrap. Cleared after `setAccountPassphrase`. Reload with pending + no DEK → recovery page, not Unlock-with-old-passphrase and not minting a new DEK.
- `PUT /v1/wrap` with `wrap: null` writes NULL (not COALESCE keep). Omitting `wrap` still leaves wrap unchanged (kit upload).
- Supersedes Spec 119 “hex always on account unlock / no typed-guess limit for revealing kit.”

## Acceptance scenarios

### Scenario: Normal unlock has no kit field

- **Given** a signed-in complete account on Unlock
- **When** the screen is shown before 3 fails
- **Then** there is no `hex-unlock-form`

### Scenario: Three wrongs hide the form and offer recovery

- **Given** account Unlock
- **When** the user submits 3 wrong passphrases
- **Then** the passphrase field and Unlock are hidden
- **And** remaining wait is shown
- **And** a control opens the recovery page

### Scenario: Kit reset blocks ledger until new passphrase

- **Given** recovery page and a valid kit
- **When** the kit unwraps
- **Then** cloud wrap is null and recovery wrap remains
- **And** the user must set a new passphrase before the ledger
- **And** reload without DEK returns to the recovery page

## Traceability

- Vitest: `apps/web/src/lib/application/lockout-wait.test.ts`; `apps/api/src/memory-store.test.js`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: UnlockScreen, AccountRecoveryScreen, App.svelte, account-lock, memory/postgres putWrap
