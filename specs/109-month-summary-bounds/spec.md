# Spec 109: Month summary range bounds

- **ID:** 109
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Month summary navigation only allows months from the earliest relevant ledger date through the current local calendar month.

## Scope

### In scope

1. Earliest month = month of the earlier of:
   - earliest **non-voided** transaction `occurredOn` (if any)
   - earliest `openingAsOf` across **all** pockets (including zero-amount openings)
2. Latest month = current local calendar month (`currentMonthKey()`)
3. Prev/next cannot leave `[earliest … latest]`; chevrons disabled at the edges
4. If the selected month is outside the range after data changes, clamp into range and refresh the summary
5. If computed earliest is after latest (e.g. future-only opening), the only allowed month is latest

### Out of scope

- Changing how Opening / Ending / income / expense / net are calculated
- A month picker control
- Per-pocket scoping of Home charts

## Domain rules

- Voided transactions do **not** affect the earliest bound
- Every pocket’s `openingAsOf` counts toward the earliest bound
- `MonthKey` comparison is lexicographic on `YYYY-MM`
- Allowed range is inclusive on both ends

## Acceptance scenarios

### Scenario: Cannot go past current month

- **Given** Home shows the current local month
- **When** the user views the next-month control
- **Then** Next month is disabled
- **And** activating it does not change the month label

### Scenario: Cannot go before earliest opening

- **Given** all pockets have `openingAsOf` in March 2026 and there are no non-voided transactions before that
- **And** the user is viewing March 2026
- **When** they view the previous-month control
- **Then** Previous month is disabled

### Scenario: Earliest transaction extends the range

- **Given** pockets open as of June 2026
- **And** a non-voided transaction on `2026-04-10`
- **When** the user navigates previous months from the current month
- **Then** they can reach April 2026
- **And** Previous is disabled on April 2026

### Scenario: Voided transaction does not extend the range

- **Given** earliest pocket `openingAsOf` is June 2026
- **And** the only April transaction is voided
- **When** bounds are resolved
- **Then** earliest month is June 2026 (voided April ignored)

### Scenario: Clamp after data shrinks the range

- **Given** the user is viewing an older month that later becomes before the new earliest bound
- **When** ledger data is refreshed
- **Then** the selected month is clamped to the new earliest (or latest if that is the only allowed month)
- **And** the summary matches the clamped month

### Scenario: Future opening only

- **Given** every pocket `openingAsOf` is after the current month and there are no non-voided txs
- **When** bounds are resolved
- **Then** earliest equals latest (current month only)

## Traceability

- Vitest: `src/lib/domain/month-summary.test.ts`, `src/lib/application/month-summary.test.ts`
- Playwright: `e2e/month-summary-bounds.e2e.ts`
- Implementation: `src/lib/domain/month-summary.ts`, `src/lib/application/month-summary.ts`, `src/lib/ui/MonthSummary.svelte`, `src/App.svelte`, `src/lib/ui/AppShell.svelte`, `src/lib/ui/AppShellChrome.svelte`

## Related

- 002 (month charts), 071 (pocket opening as-of), 014 (voided txs)
