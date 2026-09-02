# Spec 145: Remove Filters Amount compare

- **ID:** 145
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Transactions Filters no longer has an Amount compare row. Finding a sum stays on the search box (017).

## Scope

### In scope

1. Remove the Amount label, Any/lt/gt select, and amount value field from Filters (sheet and xl drawer).
2. `filterTransactions` ignores compare-amount; existing session `amountOp` / `amountRaw` do not constrain the list.
3. Clear / default / badge do not count an amount compare.
4. Criteria and session may drop `amountOp` / `amountRaw` (or always treat as none). Old session JSON with those keys still loads.

### Out of scope

- Search matching notes and amount digits (017)
- Show voided, Type, Category, Pocket, date range
- Tx sheet amount field

## Domain rules

- No lt/gt amount constraint on Activity.
- `countAdvancedFilters` / `isDefaultActivityFilters` do not use amount compare.
- `parseCompareAmount` can go if unused.

## Acceptance scenarios

### Scenario: Filters has no Amount row

- **Given** the user opens Transactions Filters
- **When** the sheet or xl drawer is visible
- **Then** there is no Amount compare control (`activity-filter-amount-op` / `activity-filter-amount`)

### Scenario: Search still finds amounts

- **Given** an expense of 15,000
- **When** the user searches `15000`
- **Then** that row still matches (017)

## Traceability

- Vitest: `apps/web/src/lib/domain/activity-filters.test.ts` — drop lt/gt cases; default/badge without amountOp
- Playwright: Filters open — amount testids absent (`e2e/activity-filters.e2e.ts` if needed)
- Implementation: `AppShellChrome.svelte`; `activity-filters.ts`; `activity-list-session.ts`

## Related

- 017 search; 139 Amount was out of that slice; 140 voided
