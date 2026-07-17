# Plan 060: Goals have X by Y

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Supersedes Spec 005 saved-amount progress model

## Why

Goals should remind: have amount **X** by date **Y**, using Main balance for “how far,” and calendar time for “how long left.”

## Scope / edges

**In:** `targetOn` deadline; balance-driven progress; sort nearest deadline; Home strip if any goals; remove saved-amount UX.

**Out:** Auto-allocating from categories; one-goal-only hard limit (multiple allowed).

## Approach

- Domain helpers + TDD first
- Application create/update with deadline
- More UI + Home strip in AppShellChrome

## TDD

See tasks — domain edges, application, Playwright More + Home (no missing cases).
