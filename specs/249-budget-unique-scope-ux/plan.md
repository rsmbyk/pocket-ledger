# Plan 249: Budget unique-scope form UX

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 247, 248

## What

Stop disabling Select all because another pocket-wide budget exists. Let the user pick any Applies-to combination and Save. Uniqueness still refuses on create/update; show that error under the Applies-to checkboxes.

## Why

A disabled Select all does not explain the unique-scope rule. With Select all off, the picker stays empty, so Save stays off for `scopeOk` — it looks like Save is blocked for the same opaque reason.

## Out of this slice

- HTTP / Cloud Run uniqueness (budgets stay in the encrypted client ledger)
- Dexie unique index
- Changing `DUPLICATE_BUDGET_SCOPE` copy
- Spec 247 complete-picker disable
- Empty-picker Save disable
