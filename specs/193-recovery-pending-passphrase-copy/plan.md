# Plan 193: Mid-reset recovery copy

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 185, 190

## Why

After a successful kit, wrap is already null. Reload before the new passphrase returns to the same recovery page as first-open, so it looks like the old passphrase might still work.

## Approach

Pass `pendingReset` into AccountRecoveryScreen. When pending reset and no DEK, keep the same title and field, change the description so it says the old passphrase is already reset and the kit is required to set a new one. First-open copy stays unchanged.
