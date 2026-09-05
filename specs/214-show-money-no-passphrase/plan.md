# Plan 214: Show money without a passphrase

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Spec 089 gated Show money behind a passphrase dialog when lock is on. Hide and show should both be one tap.

## Approach

`toggleHomeAmounts` always flips the flag. Remove the show-money dialog. Header lock and Unlock stay.
