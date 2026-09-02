# Spec 140: Voided hidden by default; Show voided

- **ID:** 140
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The Transactions list **hides voided rows by default**. The filter option is **Show voided** (unchecked = hidden).

## Scope

### In scope

1. Default list excludes voided transactions.
2. Control label **Show voided**. Unchecked = hide voided. Checked = include voided (muted/strikethrough as today).
3. Default / Clear / `isDefaultActivityFilters`: voided **hidden** (not a counted filter).
4. Checking Show voided is non-default and may increment the Filters badge.
5. Domain: `showVoided` default `false` (or invert today’s `hideVoided` default to `true`). `filterTransactions` excludes voided unless show is on.
6. Session: missing → hidden. Coerce old `hideVoided: true` → hidden; old `hideVoided: false` → show voided.
7. Testid: prefer `activity-filter-show-voided` (update e2e) or keep `activity-filter-hide-voided` if cheaper — pick one and use it everywhere.

### Out of scope

- Home Recent voided visibility
- Changing void semantics or row chrome
- Header date range (141)

## Domain rules

- Supersedes 045 default of showing voided unless Hide voided is checked.
- Clear restores hidden voided, not “show all including voided”.

## Acceptance scenarios

### Scenario: Default hides voided

- **Given** a voided tx and a live tx in the current range
- **When** Transactions opens with default filters
- **Then** only the live tx is listed
- **And** Show voided is unchecked

### Scenario: Show voided includes them

- **Given** the same ledger
- **When** the user checks Show voided and Applies (if Apply still wraps this field)
- **Then** the voided row appears with existing void chrome

### Scenario: Clear keeps them hidden

- **Given** Show voided is checked
- **When** the user Clears filters
- **Then** Show voided is unchecked and voided rows disappear

## Traceability

- Vitest: `activity-filters.test.ts` default excludes voided; `showVoided: true` includes; `isDefaultActivityFilters`; `activity-list-session.test.ts` coerce
- Playwright: `e2e/activity-filters.e2e.ts`
- Implementation: `activity-filters.ts`; `AppShellChrome.svelte`; session
- Related: 045, 102, 114 (checkbox size)

## Related

- 139 multi-select; 134 list
