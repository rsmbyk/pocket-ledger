# Plan 089: Show amounts passphrase

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Hidden Home amounts should not reveal without re-checking the passphrase when lock is enabled.

## Approach

Gate Show money with a passphrase dialog + `verifyPassphrase`; hide stays free.

## TDD

Extend `e2e/home-amounts.e2e.ts`.
