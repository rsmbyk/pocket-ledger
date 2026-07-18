# Plan 090: Header quick-lock

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Users with lock enabled need a one-tap way to lock mid-session without going through More.

## Approach

Header Lock button → `lockSession()` (`clearDataKey`) + `unlocked = false` → UnlockScreen.

## TDD

E2E: enable lock → unlock → header-lock → unlock-screen → unlock again.
