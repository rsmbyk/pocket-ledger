# Spec 193: Mid-reset recovery copy

- **ID:** 193
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When recovery is showing because the kit already unwrapped and the new passphrase is not set yet, the page tells the user the old passphrase is already reset and they must paste the kit to continue. First-open recovery (wrap still exists) keeps today’s copy.

## Scope

### In scope

`AccountRecoveryScreen` description when `pendingReset` is true (`pendingPassphraseReset && !dekPresent`).

### Out of scope

Other browsers without the Dexie pending flag, Unlock, passphrase form, restoring old-passphrase entry, wrap/kit crypto.

## Domain / UI rules

First-open:

- Title: `Reset with recovery kit`
- Description: `Paste the kit you saved when you created this account. You will set a new passphrase next.`

Mid-reset:

- Title: `Reset with recovery kit`
- Description: `Your old passphrase is already reset. Paste the recovery kit to set a new passphrase.`

Field, Continue, and Spec 190 Back gating are unchanged.

## Acceptance scenarios

### Scenario: First-open recovery copy

- **Given** account Unlock after 3 wrongs and recovery is opened
- **When** the recovery page is shown (wrap still exists)
- **Then** the description is the first-open kit paste copy
- **And** it does not say the old passphrase is already reset

### Scenario: Reload mid-reset copy

- **Given** a successful kit unwrap and no DEK after reload
- **When** the recovery page is shown
- **Then** the description is `Your old passphrase is already reset. Paste the recovery kit to set a new passphrase.`
- **And** there is no Back

## Traceability

- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `AccountRecoveryScreen.svelte`, `App.svelte`
