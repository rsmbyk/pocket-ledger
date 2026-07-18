# Plan 071: Pocket opening balance + derived balance

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070

## Why

Each pot needs a known starting balance as of a date so current balance reflects real money without backfilling every historical tx.

## Scope / edges

**In:** One opening amount + as-of date per pocket; derive current balance; show on Pockets list/detail; Home all-pockets balance uses sum of pocket balances (transfer-aware once 073 lands — until then income/expense only).

**Out:** Multiple historical statements; per-pocket Home switcher.

## Approach

- Fields: `openingBalanceMinor`, `openingAsOf` (YYYY-MM-DD, default today on create)
- `derivePocketBalance(pocket, txs)` = opening + sum of pocket-scoped deltas for non-voided txs with `occurredOn >= openingAsOf`
- Pocket-scoped delta: income/expense on `accountId`; transfers (073) −source / +dest
- Edit opening updates fields; recompute display

## TDD

- Heavy Vitest on derivation edges (before as-of excluded; voided; transfer sides)
