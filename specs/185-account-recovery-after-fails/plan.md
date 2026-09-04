# Plan 185: Account recovery after failed unlocks

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119, 183

## Why

Account Unlock always shows the recovery kit. After three wrongs the form stays visible but disabled. After a kit paste, wrap is not cleared so reload can skip setting a new passphrase.

## Approach

Hide kit on normal Unlock. After 3 wrongs keep the existing cooldown, hide the passphrase form, tick remaining wait, and offer a full-screen recovery page. Successful kit clears passphrase wrap (keep recovery wrap). Ledger stays blocked until a new passphrase, including after reload.
