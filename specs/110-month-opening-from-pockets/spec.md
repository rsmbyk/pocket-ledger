# Spec 110: Month opening from pocket openings

- **ID:** 110
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Month summary **Opening** is the sum of every pocket’s balance at the start of the month’s first day, inferred from each pocket’s opening balance and as-of date by walking transactions backward and forward. **Ending** remains Opening + Net.

## Scope

### In scope

1. Domain helper: balance at the start of a given calendar day for one pocket, from that pocket’s `openingBalanceMinor` / `openingAsOf` and ledger effects
2. `buildMonthSummary` Opening = sum of that helper over **all** pockets at `${monthKey}-01`
3. Ending = Opening + Net (unchanged identity)
4. Income / expense / net / category breakdowns unchanged
5. Inference uses the same per-pocket deltas as derived balance (`pocketDelta`), including transfer fees

### Out of scope

- Changing Spec 071 current pocket balance (`derivePocketBalance` still ignores txs with `occurredOn < openingAsOf`)
- Per-pocket scoping of Home charts
- Month navigation bounds (Spec 109)
- UI chrome beyond the Opening/Ending amounts updating

## Domain rules

### Balance at day start

For pocket `P` and day `D` (`YYYY-MM-DD`):

- Seed = `P.openingBalanceMinor` known as of `P.openingAsOf`
- If `D === openingAsOf` → seed
- If `D > openingAsOf` → seed + Σ `pocketDelta(tx, P)` for non-voided txs with `openingAsOf <= occurredOn < D`
- If `D < openingAsOf` → seed − Σ `pocketDelta(tx, P)` for non-voided txs with `D <= occurredOn < openingAsOf`

Voided transactions contribute `0` (via `pocketDelta`).

### Month Opening / Ending

- `openingMinor(month) = Σ balanceAtDayStart(pocket, \`${month}-01\`, txs)` over all pockets
- `endingMinor = openingMinor + netMinor`
- In-month income, expense (including Admin Fee), and net rules from Specs 002 / 106 are unchanged
- Spec 071 current-balance rule is unchanged: historical day-start inference is **only** for month Opening/Ending, not for the pocket’s displayed current balance

## Acceptance scenarios

### Scenario: No mid-gap transactions

- **Given** pocket A has opening `100_000` as of `2026-06-15`
- **And** there are no non-voided transactions with `2026-06-01 <= occurredOn < 2026-06-15` affecting A
- **When** the June 2026 month summary is built
- **Then** Opening includes `100_000` for pocket A

### Scenario: Reverse expense before as-of

- **Given** pocket A has opening `100_000` as of `2026-06-15`
- **And** a non-voided expense `25_000` on `2026-06-05` on pocket A
- **When** the June 2026 month summary is built
- **Then** Opening includes `125_000` for pocket A (seed minus delta of −25_000)

### Scenario: Forward into a later month

- **Given** pocket A has opening `100_000` as of `2026-06-15`
- **And** a non-voided expense `10_000` on `2026-06-20` on pocket A
- **And** no other txs affecting A before `2026-07-01`
- **When** the July 2026 month summary is built
- **Then** Opening includes `90_000` for pocket A

### Scenario: Multi-pocket sum

- **Given** pocket A opening `100_000` as of `2026-06-01`
- **And** pocket B opening `50_000` as of `2026-06-01`
- **And** no prior txs
- **When** the June 2026 month summary is built
- **Then** Opening is `150_000`

### Scenario: Voided transaction ignored

- **Given** pocket A opening `100_000` as of `2026-06-15`
- **And** a voided expense `25_000` on `2026-06-05` on pocket A
- **When** the June 2026 month summary is built
- **Then** Opening includes `100_000` for pocket A (voided ignored)

### Scenario: Ending equals Opening plus Net

- **Given** a month with Opening inferred from pockets and in-month net `N`
- **When** the month summary is built
- **Then** Ending is Opening + `N`

### Scenario: Zero openings and no txs

- **Given** all pockets have opening `0` (any as-of)
- **And** there are no non-voided transactions
- **When** any allowed month summary is built
- **Then** Opening is `0` and Ending is `0`

## Traceability

- Vitest: `src/lib/domain/pocket-balance.test.ts`, `src/lib/domain/month-summary.test.ts`, `src/lib/application/month-summary.test.ts`
- Playwright: `e2e/month-opening-from-pockets.e2e.ts`
- Implementation: `src/lib/domain/pocket-balance.ts`, `src/lib/domain/month-summary.ts`, `src/lib/application/month-summary.ts`

## Related

- 002 (month charts), 071 (pocket opening), 106 (transfer fee / prior opening), 109 (bounds; Opening calc deferred here)
