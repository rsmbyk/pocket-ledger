# Spec 067: Remove Categories sort

- **ID:** 067
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Remove the Activity Sort option **Categories** and its domain sort mode. Keep Default (create time), Date descending, and Date ascending.

## Scope

### In scope

1. Remove Sort sheet option Categories (`activity-sort-category`)
2. Remove `category` from `ActivitySortMode` and `sortTransactions` category path
3. Stop passing category meta solely for sort (filter by category unchanged)
4. Update unit and e2e coverage

### Out of scope

- Category filter dropdown
- Changing Default / Date sort semantics (beyond removing category)

## Domain rules

- `ActivitySortMode` = `'createdAt-desc' | 'occurredOn-desc' | 'occurredOn-asc'`
- Spec 064 Categories mode is superseded by this spec

## Acceptance scenarios

### Scenario: Sort sheet has three options

- **Given** Activity Sort sheet open
- **When** it renders
- **Then** options are Default, Date (descending), Date (ascending)
- **And** there is no Categories option

### Scenario: Domain rejects category mode

- **Given** unit tests for sort
- **When** they run
- **Then** there is no passing test that sorts by `category` mode

## Traceability

- Vitest: `src/lib/domain/activity-filters.test.ts` (TDD first)
- Playwright: `e2e/activity-filters.e2e.ts`
- Implementation: `activity-filters.ts`, `AppShellChrome.svelte`

## Related

- Spec 064 (supersedes Categories sort portion)
- Spec 068 (date groups assume date sorts only)
