# Plan 183: Onboarding passphrase live check

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 157, 163, 169

## Why

Cloud **Set your account passphrase** still validates on Continue with alerts. Settings Privacy already has live icons, **At least 8 characters**, and a disabled submit until the pair is valid. Onboarding should use that mechanism.

## Approach

Extract the Privacy new-passphrase pair into a shared UI. Account passphrase screen uses it; Continue disabled until length ≥ 8 and confirm matches. Settings enable-lock behavior unchanged.

## Scope / edges

**In:** Shared fields, AccountPassphraseScreen, Playwright Continue disabled until valid.

**Out:** UnlockScreen, disable-lock, backup/export, Hex kit, changing min-length 8.
