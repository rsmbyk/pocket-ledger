# Plan 110: Month opening from pocket openings

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 002 (month charts); Spec 071 (pocket opening + derived balance); Spec 106 (transfer admin fee); Spec 109 (month bounds — Opening math left unchanged there)

## Why

Home month **Opening** is currently the signed sum of transactions before the month start. Pocket `openingBalanceMinor` / `openingAsOf` are ignored, so Opening/Ending diverge from Home Balance (sum of derived pocket balances).

Infer each month’s Opening from every pocket’s known opening by walking ledger effects backward and forward to the month-start day.

## Scope / edges

**In:**

- Domain helper: balance at start of a calendar day from pocket opening + txs (backward / forward)
- Month `openingMinor` = sum of that helper over all pockets at `${monthKey}-01`
- `endingMinor = openingMinor + netMinor` (identity unchanged)
- Prior transfer fees and cross-pocket transfers stay correct via `pocketDelta`

**Out:**

- Changing Spec 071 current-balance cutoff (`derivePocketBalance` still ignores `occurredOn < openingAsOf`)
- Per-pocket month charts
- UI copy/layout beyond Opening/Ending numbers
- Month navigation bounds (Spec 109)

## Approach

- Domain: `balanceAtDayStart` (or equivalent) in `pocket-balance.ts`; `buildMonthSummary` takes pockets and uses the sum for `openingMinor`
- Application: `loadMonthSummary` already loads pockets — pass them into `buildMonthSummary`
- Vitest first; thin Playwright for mid-gap reverse expense → Opening

## TDD

- Vitest: `pocket-balance.test.ts` (day-start inference); `month-summary.test.ts` (opening from pockets; update prior-tx / fee fixtures)
- Playwright: month Opening reflects reverse of mid-gap expense before pocket as-of
