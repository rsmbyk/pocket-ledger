# Spec 017: Activity filters + search

- **ID:** 017
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Help users find transactions on Activity by type, category, date range, and free-text search over notes and amounts.

## Scope

### In scope

- Filter bar on Activity only (not Home Recent):
  - **Type:** All | Income | Expense
  - **Category:** All, or one selected category
  - **Dates:** optional start and end (`YYYY-MM-DD`); empty bound = open-ended
- **Search** field matching:
  - note (case-insensitive substring)
  - amount with loose digit matching: strip non-digits from query; `10000` and `100,000` both match `amountMinor` 100000
- Filters and search combine with **AND**
- Voided rows still appear when they match (same list as Activity)
- Client-side filter over the loaded transaction list; domain helper + Vitest

### Out of scope

- Multi-select categories
- Saved filter presets
- Home Recent filters
- New IndexedDB indexes / server queries
- Transfer type filter (unless transfers exist in UI later)

## Domain rules

- `filterTransactions(transactions, criteria)` returns txs matching all provided criteria
- Type filter: when not All, `tx.type` must equal selected kind
- Category filter: when set, `tx.categoryId` must equal selected id
- Date: `occurredOn >= start` if start set; `occurredOn <= end` if end set
- Search: if query non-empty after trim, match note substring **or** amount digit match
- Amount digit match: compare digits-only query to decimal string of `amountMinor` (no currency symbols required)

## Acceptance scenarios

### Scenario: Filter by expense type

- **Given** income and expense txs
- **When** the user selects Expense
- **Then** only expense rows are listed

### Scenario: Filter by category

- **Given** Food and Salary txs
- **When** the user selects category Food
- **Then** only Food txs are listed

### Scenario: Date range

- **Given** txs on 2026-07-01 and 2026-07-15
- **When** start=2026-07-10 and end=2026-07-31
- **Then** only the 2026-07-15 tx is listed

### Scenario: Amount search ignores separators

- **Given** an expense of 100000 minor units
- **When** the user searches `10000` or `100,000`
- **Then** that transaction is listed

### Scenario: Note search

- **Given** a tx with note `secret lunch`
- **When** the user searches `lunch`
- **Then** that transaction is listed

## Traceability

- Vitest: new `src/lib/domain/activity-filters.test.ts` (or equivalent)
- Playwright: new or extended Activity e2e
- Implementation: domain filter helper; Activity UI in `ActivityTable.svelte` / `AppShellChrome.svelte`
- Depends on: spec 014 for voided row appearance in filtered results; ideally 016 for Activity chrome
