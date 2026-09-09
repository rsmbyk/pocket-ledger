# Spec 242: Pocket details Transfers bucket

- **ID:** 242
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On pocket details, show how much moved **in** and **out** this month and include that net in Ending so it matches the pocket’s actual month-end balance. Transfers stay a third bucket — not income, not expense. Home month summary is unchanged.

## Scope

### In scope

1. Pocket-scoped `buildMonthSummary`: Transfer in, Transfer out, TransferNet (principal only).
2. Pocket Ending = Opening + Net + TransferNet.
3. Pocket details `MonthSummary`: Transfers chart after Expenses (two rows, in/out colors); footer Transfers line between Net and Ending.
4. Home: no Transfers chart, no footer line, Ending still Opening + Net.

### Out of scope

- Home in/out volume chart
- Transfer categories or per-corridor bars
- Changing Income | Expenses | Net tiles
- Activity list, Plans

## Domain rules

- Home (`buildMonthSummary` without `pocketId`): transfer principal still contributes 0 to income/expense; `transferInMinor` / `transferOutMinor` / `transferNetMinor` are 0; **Ending = Opening + Net** (110). Fees still expense under Admin Fee (106).
- When scoped to pocket `P`, for non-voided in-month transfers:
  - Destination (`counterAccountId === P`): Transfer in += `amountMinor` (not income; no fee).
  - Source (`accountId === P`): Transfer out += `amountMinor`; fee still Expenses → Admin Fee (106).
- `transferNetMinor` = in − out (principal only).
- Pocket **Ending** = Opening + Net + TransferNet. This matches `balanceAtDayStart` of the next month’s first day.
- Incoming transfers remain **not** income (148). Voided rows ignored (014).
- **Supersedes 148** only on pocket Ending (`Opening + Net` → `Opening + Net + TransferNet`).

## UI rules

- Same `MonthSummary` card. Pocket details passes `showTransfers`; Home does not.
- Top tiles stay Income | Expenses | Net (cashflow; Net is still income − expense).
- After the Expenses chart, before Opening/Net/Ending: section title **Transfers** (ArrowLeftRight icon).
- Chart: **exactly two rows**, fixed order — **Transfer in** (`--income`), **Transfer out** (`--destructive`). Not per-corridor.
- Both zero → empty copy `No transfers this month.` If only one side is non-zero, still show both rows (the other is 0).
- Footer: **Transfers** (signed TransferNet, same sign colors as Net / 031) between Net and Ending. Always shown on pocket details (including 0).
- Hide-amounts still masks (048).

## Acceptance scenarios

### Scenario: Home ignores transfer principal

- **Given** a transfer Main → Vacation this month (optional fee)
- **When** Home month summary renders
- **Then** there is no Transfers chart or footer Transfers line
- **And** Ending is still Opening + Net (fee in Expenses if present)

### Scenario: Pocket in and out

- **Given** a transfer Main → Vacation of 10_000 with fee 250 this month
- **When** Vacation details month summary renders
- **Then** Transfer in is 10_000, Transfer out is 0, footer Transfers is +10_000
- **And** income is 0 and the fee is not an expense on Vacation
- **When** Main details month summary renders
- **Then** Transfer in is 0, Transfer out is 10_000, footer Transfers is −10_000
- **And** expense includes 250 under Admin Fee

### Scenario: Pocket Ending matches actual close

- **Given** the same transfer
- **When** either pocket’s month summary is built
- **Then** Ending equals that pocket’s balance at the start of the next month

### Scenario: Empty transfers

- **Given** a pocket with no in-month transfers
- **When** details month summary renders
- **Then** the Transfers chart shows `No transfers this month.`
- **And** footer Transfers is 0
- **And** Ending equals Opening + Net

### Scenario: Hide amounts

- **Given** hide-amounts is on
- **When** pocket details month summary renders
- **Then** Transfer in/out amounts and footer Transfers are masked (`••••`)

## Traceability

- Vitest: `apps/web/src/lib/domain/month-summary.test.ts`
- Playwright: `e2e/pocket-details.e2e.ts`; Home absence in `e2e/month-charts.e2e.ts`
- Implementation: `month-summary.ts`, `MonthSummary.svelte`, `PocketDetailsPanel.svelte`, `CategoryBreakdownChart.svelte` (per-row bar color if reused)

## Related

- 002, 031, 048, 106, 110, 148
