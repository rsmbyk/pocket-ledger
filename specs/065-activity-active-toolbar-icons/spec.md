# Spec 065: Active Sort/Filters icon chrome

- **ID:** 065
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Show that Sort and/or Filters are non-default by styling those icon buttons as **primary outline** (primary-colored border/text with light primary fill), while idle buttons stay the current neutral outline.

## Scope

### In scope

1. **Sort button** (`activity-sort-open`): use primary-outline styling when sort mode is **not** Default (`createdAt-desc`)
2. **Filters button** (`activity-filters-open`, &lt;1280 only): use primary-outline styling when advanced filters are active (same condition as today’s badge: `hasAdvancedFilters`)
3. Idle state: keep current neutral `outline` look
4. Filters badge (count) remains when advanced filters are active
5. Still icon-only; accessible names unchanged

### Out of scope

- Solid filled primary (no outline)
- Treating live search alone as “filters active”
- Changing xl always-on filters drawer styling
- Changing sort/filter semantics

## Domain rules

- Sort active ⇔ `activitySort !== 'createdAt-desc'` (DEFAULT_ACTIVITY_SORT)
- Filters active ⇔ advanced filter count &gt; 0 (unchanged from Spec 049/064 badge)

## Acceptance scenarios

### Scenario: Default Sort looks idle

- **Given** Activity with Default sort
- **When** the Sort button renders
- **Then** it uses the neutral outline style (not primary-outline)

### Scenario: Non-default Sort looks active

- **Given** the user selects Date (descending) in Sort
- **When** the Sort sheet closes
- **Then** `activity-sort-open` shows primary-outline styling

### Scenario: Filters look active when applied

- **Given** Activity with an applied type filter (badge visible)
- **When** the Filters button is shown (&lt;1280)
- **Then** `activity-filters-open` shows primary-outline styling
- **And** the badge remains

### Scenario: Clearing Filters returns idle chrome

- **Given** Filters button in primary-outline state
- **When** the user clears and applies defaults
- **Then** Filters button returns to neutral outline

## Traceability

- Vitest: none
- Playwright: `e2e/activity-filters.e2e.ts`
- Implementation: `src/lib/ui/AppShellChrome.svelte` (+ optional Button class helpers)

## Related

- Spec 064 (Sort sheet + icon Filters)
