# Spec 075: Activity filter by pocket

- **ID:** 075
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Filter Activity by pocket. Default **All**. A transfer matches if the selected pocket is **source or destination**.

## Scope

### In scope

1. Pocket filter in Activity filters UI: **All** + each pocket in 070 order with Main icon on Main
2. Draft / Apply / Clear behavior consistent with existing advanced filters
3. Domain filter: selected pocket id vs all
4. Filter badge counts an active non-All pocket filter

### Out of scope

- Filtering Home Recent by pocket
- Multi-select pockets
- Dedicated Transfer type filter chip (All still includes transfers)

## Domain rules

- Default `pocketId = 'all'` (or equivalent null)
- When set to pocket `P`: include non-filtered-out txs where `accountId === P` OR (`counterAccountId === P`)
- Still AND with existing criteria (type, category, dates, search, etc.)

## Acceptance scenarios

### Scenario: Default all

- **Given** txs on Main and Vacation
- **When** filters are default
- **Then** Activity shows both pockets’ txs (subject to other filters)

### Scenario: Filter one pocket

- **Given** an expense on Main and an expense on Vacation
- **When** the user applies pocket filter Main
- **Then** only Main’s expense shows

### Scenario: Transfer either side

- **Given** a transfer Main → Vacation
- **When** the user filters by Vacation
- **Then** that transfer is included
- **And** when filtering by Main it is also included

### Scenario: Clear

- **Given** an applied pocket filter
- **When** the user Clears advanced filters
- **Then** pocket returns to All (search behavior unchanged per existing Clear rules)

## Traceability

- Vitest: extend `activity-filters.test.ts`
- Playwright: apply pocket filter; transfer either-side; Clear
- Implementation: `activity-filters.ts`; filters UI; `AppShellChrome.svelte`

## Related

- 017, 045, 058, 070, 073
