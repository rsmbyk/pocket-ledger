# Spec 102: Activity session sort + filters persistence

- **ID:** 102
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Persist Activity **sort mode** and **applied filters** (including search) for the lifetime of the browser **tab session** via `sessionStorage`, so a reload keeps the user’s list view. Closing the tab clears the state. Do not use `localStorage`.

## Scope

### In scope

1. Persist `activitySort` (`ActivitySortMode`)
2. Persist **applied** `ActivityFilterCriteria` (type, category, dates, search, hideVoided, amount op/raw, pocket)
3. On restore: hydrate `applied` and set `draft` from `applied` (no restored dirty draft)
4. Shared read/write helper with injectable `Storage` for tests; storage key `pocket-ledger-activity-list`
5. Invalid / missing data → defaults (`DEFAULT_ACTIVITY_SORT`, `DEFAULT_ACTIVITY_FILTERS`)

### Out of scope

- Cross-session persistence (`localStorage`)
- Persisting Sort/Filters sheet open state, discard-confirm open, or chunked reveal position
- Changing filter Apply/Clear/dirty semantics or Sort options
- Persisting Home Recent or other panels’ state

## Domain / storage rules

- Storage backend: `sessionStorage` only
- Write after successful changes to sort or applied filters (including live search updates)
- Read once on Activity shell init (or first mount of chrome that owns the state)
- Unknown `activitySort` string → `createdAt-desc`
- Malformed JSON or non-object → treat as empty / defaults
- Individual filter fields: coerce to known shapes; ignore unknown keys
- Supersedes Spec 045 “applied/draft filters are not persisted across reloads” and Spec 064 “not persisted” — **within a tab session**, sort + applied filters **are** restored after reload

## Acceptance scenarios

### Scenario: Sort survives reload

- **Given** the user selected Date (ascending) on Activity
- **When** the page fully reloads in the same tab
- **Then** Sort remains Date (ascending) and the list order matches that mode

### Scenario: Applied filters survive reload

- **Given** applied filters include Type Expense and a non-empty search
- **When** the page fully reloads in the same tab
- **Then** the list still shows only matching expenses and search is restored
- **And** reopening Filters shows draft matching those applied values

### Scenario: Dirty draft is not restored mid-edit

- **Given** applied filters are defaults and the user edits draft Type to Expense without Apply
- **When** the page reloads before Apply
- **Then** applied (and draft after hydrate) are defaults — unapplied draft edits are not persisted

### Scenario: New tab starts clean

- **Given** another tab previously had custom sort/filters in its own session
- **When** the user opens a new tab to the app
- **Then** sort and filters start at defaults (no cross-tab `sessionStorage` sharing is required beyond normal browser behavior; each tab has its own session storage)

### Scenario: Garbage storage

- **Given** `sessionStorage` holds invalid JSON for the activity-list key
- **When** the app initializes
- **Then** sort and filters use defaults without crashing

## Traceability

- Vitest: `src/lib/shared/activity-list-session.test.ts` (TDD first) — parse/validate/read/write
- Playwright: `e2e/activity-filters.e2e.ts` — reload restores sort + applied filters
- Implementation: `src/lib/shared/activity-list-session.ts`; wire in `src/lib/ui/AppShellChrome.svelte`

## Related

- Spec 045, 064, 067, 075
- Spec 101 (date sort secondary — separate concern)
