# Plan 188: Change account passphrase

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119, 157, 183

## Why

Signed-in Privacy still stubs “change it from unlock after a reload.” Spec 119 already allows change, not remove.

## Approach

Current passphrase + NewPassphraseFields. Unwrap old, reject if new equals old, rewrap DEK, PUT wrap, enableLock. No 3-fail cooldown on this form.
