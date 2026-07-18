# Spec 068: Activity date groups + note secondary

- **ID:** 068
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Activity only: when sorting by date, group transactions under date headers and stop repeating dates on each row. Use the secondary line for notes (or a spacer to keep height). Home Recent stays as today.

## Scope

### In scope

1. **Date group headers** (`occurredOn`, `formatOccurredOnDisplay`) **only** when Sort is `occurredOn-desc` or `occurredOn-asc`
2. When Sort is Default (`createdAt-desc`): **no** date headers — flat list
3. Activity rows: **no** date secondary line; show **note** if non-empty, else empty `text-xs` spacer (same approximate height as before)
4. Home Recent: unchanged (date / 063 multi-line behavior)
5. Pure domain helper for building groups (testable)

### Out of scope

- Sticky/pinned headers while scrolling (plain section headers OK)
- Lazy/chunked reveal (Spec 069)
- Home Recent layout changes

## Domain rules

- Grouping key = `occurredOn` (ISO day)
- Groups only constructed/used for date sort modes; Default path does not emit group headers
- Within a day, preserve relative order from `sortTransactions`

## Acceptance scenarios

### Scenario: Date sort shows group headers

- **Given** Activity txs on two different `occurredOn` days
- **When** Sort is Date (descending)
- **Then** each day has a visible date header
- **And** rows under a header do not show a date line

### Scenario: Default sort has no headers

- **Given** the same txs
- **When** Sort is Default
- **Then** there are no date group headers
- **And** rows still use note/spacer secondary (no per-row date on Activity)

### Scenario: Note on secondary

- **Given** an Activity row with note `Coffee`
- **When** it renders
- **Then** the secondary line shows `Coffee` (not the date)

### Scenario: Home Recent still shows date

- **Given** a Recent row
- **When** Home renders
- **Then** the date remains visible on the Recent row (063 behavior)

## Traceability

- Vitest: domain grouping helper (TDD first) — e.g. extend `activity-filters.test.ts` or `activity-list-groups.test.ts`
- Playwright: `e2e/activity-filters.e2e.ts` / dedicated activity list e2e
- Implementation: domain helper; `ActivityTable.svelte`; `TransactionListRow.svelte`

## Related

- Spec 063, 067, 069
