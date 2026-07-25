# Plan 109: Month summary range bounds

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 002 (month charts); Spec 071 (pocket opening as-of)

## Why

Home month summary prev/next can scroll into empty past and future months. Bound navigation to real ledger history through the current local month.

## Scope / edges

**In:** Earliest allowed month = min(earliest non-voided `occurredOn`, earliest pocket `openingAsOf`); latest = current local month; clamp selection; disable prev/next at bounds.

**Out:** Changing Opening/Ending/net math; month pickers; per-pocket chart scoping.

## Approach

- Domain: `resolveMonthBounds`, `clampMonthKey`, `canShiftMonth` in `month-summary.ts`
- Application: load pockets + txs, compute bounds, clamp requested key before `buildMonthSummary`
- UI: `canPrev` / `canNext` on MonthSummary chevrons; App handlers no-op at bounds; refresh clamps after data changes

## TDD

- Vitest: domain bounds helpers; application load clamps
- Playwright: next disabled on current month; cannot go before earliest opening/tx month
