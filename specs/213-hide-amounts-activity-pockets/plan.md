# Plan 213: Hide amounts on Activity and Pockets list

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

The header eye only appears on Home and pocket details. Activity and the Pockets list still show money.

## Approach

Show the same eye on those routes. Pass the existing hide flag into ActivityTable and PocketsPanel. Same `pocket-ledger-hide-amounts` key.
