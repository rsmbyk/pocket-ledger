# Plan 190: Back from account recovery to passphrase

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 185

## Why

The kit recovery page is a dead end. After three wrongs, Unlock offers recovery; once that page is open there is no way back to try the passphrase again.

## Approach

Outline **Back** on the recovery page when it was opened from Unlock and wrap still exists. Hide it after a successful kit (pending reset, no DEK). Back returns to account Unlock; recovery remains offered. Cooldown unchanged.
