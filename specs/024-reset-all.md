# Spec 024: Reset everything (More)

- **ID:** 024
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Let the user wipe ledger data from More while optionally preserving categories and/or passphrase lock settings, then return to a usable app with a fresh Main account under current product defaults.

## Scope

### In scope

- Destructive **Reset everything** on More (Backup / danger zone): `data-testid="reset-all"`, destructive styling
- Confirm via a **dialog** (not bare `window.confirm`) with a clear warning: local data will be permanently deleted; suggest export first; cannot be undone
- Dialog checkboxes, both **default unchecked**:
  - **Keep categories**
  - **Keep passphrase lock**
- Always wipe regardless of checkboxes:
  - transactions
  - recurring
  - goals
  - net-worth snapshots
  - accounts (then recreate Main via existing bootstrap / `ensureDefaultAccount`)
  - session crypto key (`clearDataKey`)
- Optional preserve when checked:
  - **Keep categories:** leave the categories table intact
  - **Keep passphrase lock:** leave lock-related settings keys (`SETTINGS_LOCK_SALT`, `SETTINGS_LOCK_VERIFIER`, and `SETTINGS_ENCRYPTION_ENABLED` if used); other settings may still be cleared as needed for a clean ledger
- Theme preference in `localStorage` (`pocket-ledger-theme`) left alone
- UI refreshes like after import (`bootstrap`) so the app is usable without a full browser reload

### Out of scope

- Changing whether seed categories exist on bootstrap (025)
- Auto-export before reset
- Import/export format changes
- Partial wipe of individual transaction rows without full reset

## Domain rules

- After reset, the app is usable without a full browser reload
- Accounts are always cleared and Main is recreated
- Transactions, recurring, goals, and net-worth are always cleared
- `clearDataKey` always runs
- If **Keep categories** is unchecked, categories are wiped (post-025: no automatic re-seed unless product rules say otherwise)
- If **Keep passphrase lock** is unchecked, lock salt/verifier (and encryption-enabled flag if used) are cleared so the lock is gone
- If **Keep passphrase lock** is checked, the user can still unlock with the same passphrase after reset
- Theme `localStorage` is never cleared by this flow

## Acceptance scenarios

### Scenario: Full wipe (both preserve flags off)

- **Given** saved transactions, categories, recurring, goals, net-worth, and an optional passphrase lock
- **And** both Keep categories and Keep passphrase lock are unchecked (defaults)
- **When** the user confirms Reset everything in the dialog
- **Then** transactions, recurring, goals, net-worth, and accounts are gone
- **And** categories and lock settings are gone
- **And** Main account is recreated and the app remains usable
- **And** theme preference is unchanged

### Scenario: Preserve categories only

- **Given** custom categories and at least one transaction
- **And** Keep categories is checked and Keep passphrase lock is unchecked
- **When** the user confirms Reset everything
- **Then** transactions (and recurring, goals, net-worth, accounts) are wiped and Main is recreated
- **And** categories still exist
- **And** lock settings are cleared if they were present

### Scenario: Preserve passphrase lock only

- **Given** a configured passphrase lock and ledger data
- **And** Keep passphrase lock is checked and Keep categories is unchecked
- **When** the user confirms Reset everything
- **Then** ledger tables listed under always-wipe are cleared and Main is recreated
- **And** categories are wiped
- **And** `SETTINGS_LOCK_SALT`, `SETTINGS_LOCK_VERIFIER`, and `SETTINGS_ENCRYPTION_ENABLED` (if used) remain so the same passphrase still unlocks

### Scenario: Preserve both

- **Given** categories and a passphrase lock plus other ledger data
- **And** both Keep categories and Keep passphrase lock are checked
- **When** the user confirms Reset everything
- **Then** transactions, recurring, goals, net-worth, and accounts are wiped; Main is recreated; `clearDataKey` has run
- **And** categories and lock settings remain

### Scenario: Cancel leaves data

- **Given** existing data
- **When** the user cancels or dismisses the reset dialog
- **Then** data is unchanged

## Traceability

- Vitest: application reset use case (wipe + preserve flag matrix)
- Playwright: More → reset dialog (confirm / cancel / checkbox preserve)
- Implementation: application reset helper; `MorePanel.svelte`; `App.svelte` wiring
- Depends on: 003, 007, 008, 015
