# Spec 190: Back from account recovery to passphrase

- **ID:** 190
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The kit recovery page can return to account Unlock so the user can try the passphrase again, but only while the old wrap still exists. After a successful kit, wrap is null and Back stays hidden.

## Scope

### In scope

1. Outline full-width **Back** under Continue on `account-recovery-screen` (`data-testid="recovery-back"`).
2. Show Back when recovery was opened from Unlock (`accountRecoveryOpen`) and there is no pending passphrase reset.
3. Hide Back when the page is up only because `pendingPassphraseReset` with no DEK (kit already unwrapped / reload mid-reset).
4. Back clears `accountRecoveryOpen` and returns to account Unlock. `recoveryOffered` stays true. Cooldown unchanged.

### Out of scope

- Changing wrap / kit / lockout rungs
- Device Unlock
- New hex kit

## Domain / UI rules

- Spec 185 still holds: after a successful kit, reload without DEK stays on recovery. Back must not appear in that state.
- If cooldown is still active, Unlock shows remaining wait, not the passphrase field.

## Acceptance scenarios

### Scenario: Back returns to Unlock

- **Given** account Unlock after 3 wrongs and the recovery page is open
- **When** the user taps Back
- **Then** they see `account-unlock-screen`
- **And** Reset with recovery kit is still available

### Scenario: No Back after kit unwrap

- **Given** pending passphrase reset and no DEK
- **When** the recovery page is shown
- **Then** there is no `recovery-back`

## Traceability

- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `AccountRecoveryScreen.svelte`, `App.svelte`
