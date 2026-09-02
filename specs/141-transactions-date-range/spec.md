# Spec 141: Transactions header date range (month or custom)

- **ID:** 141
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Transactions, the date range lives at the **center of the sticky header**. Default is this calendar month through today. Users can pick another **month** or a **custom** start/end. Filters no longer contain From/To.

## Scope

### In scope

1. Transactions-only header cluster (title stays left). Not on Home / Pockets / other routes.
2. **Modes** (segmented, live — not behind Filters Apply):
   - **Month** (default): pick `YYYY-MM` (`monthKey` / `formatMonthLabel`). Range = first of that month through **last of that month**, except the **current** local month is first of month through **today**. Native `type="month"` or equivalent; must actually open (135 patterns).
   - **Custom:** two DateFields (start and end), `YY Mon DD`. If start > end, snap so start ≤ end.
3. Switching Month → Custom keeps the derived start/end. Custom → Month snaps to the month of **start**.
4. List filter: `occurredOn` inclusive in `[start, end]` (same compares as today’s startDate/endDate).
5. **Remove** From / To from the filter sheet and drawer. Dates are not a Filters badge count. Sheet **Clear** does not reset this control.
6. **Session:** persist `mode` (`month` | `custom`) plus `monthKey` and/or start/end. Missing/empty old From/To → Month + current month (not all-time).
7. Helper(s) for default range and last day of month; Vitest-backed.

### Out of scope

- All-time list
- Custom calendar library
- Changing Home month chevrons / month summary
- Prev/next month chevrons (optional, not required)

## Domain rules

- `start` / `end` are ISO days. Current month (Month mode): `end = todayOccurredOn()`.
- Other months: `end` = last calendar day of that month.
- Inclusive both ends: `occurredOn >= start && occurredOn <= end`.

## Acceptance scenarios

### Scenario: Default this month through today

- **Given** today is `2026-09-02` and txs on `2026-09-01`, `2026-09-02`, and `2026-08-15`
- **When** Transactions opens with no stored range
- **Then** mode is Month, month is `2026-09`
- **And** the 1 Sep and 2 Sep txs show
- **And** the 15 Aug tx does not

### Scenario: Past month is full month

- **Given** Month mode
- **When** the user selects `2026-08`
- **Then** the range is `2026-08-01` through `2026-08-31`
- **And** August txs in that span show

### Scenario: Custom two dates

- **Given** Custom mode
- **When** the user sets start `2026-08-10` and end `2026-08-20`
- **Then** only txs with `occurredOn` in that inclusive range show
- **And** the change applies without opening Filters / Apply

### Scenario: Mode switch

- **Given** Month `2026-08` (full August)
- **When** the user switches to Custom
- **Then** start is `2026-08-01` and end is `2026-08-31`
- **Given** Custom start `2026-07-04` end `2026-07-20`
- **When** the user switches to Month
- **Then** the selected month is `2026-07`

### Scenario: From/To gone from Filters

- **Given** the Filters sheet or xl drawer
- **When** it renders
- **Then** `activity-filter-start` and `activity-filter-end` are absent
- **And** Clear does not change the header range

### Scenario: Start after end snaps

- **Given** Custom mode with start `2026-09-10` and end `2026-09-01`
- **When** the values are applied
- **Then** start ≤ end (swap or clamp)

## Traceability

- Vitest: range helpers (current month → today; past month last day; snap start≤end; mode switch mapping) in `activity-filters.test.ts` or a small `transaction-date-range.test.ts`
- Playwright: default month→today; switch month vs custom; From/To absent in Filters
- Implementation: domain helpers; `AppShellChrome.svelte` header cluster; drop sheet DateFields; session
- Depends: 135 DateField open; 134 Transactions route/copy

## Related

- 042 DateField; 045 From/To in sheet (supersede placement); 102 session; 110 month keys
- **142** supersedes header placement (single-button picker in a sticky chrome band). Domain rules here remain.
