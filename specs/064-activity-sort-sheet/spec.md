# Spec 064: Activity Sort sheet + icon-only Filters

- **ID:** 064
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add an Activity **Sort** control (icon-only sheet) and make the **Filters** open control icon-only. Sort options cover create-time default, occurred-on directions, and category set ordering (incomes first).

## Scope

### In scope

1. **Filters button** (`activity-filters-open`, viewport &lt; 1280): icon-only — no visible “Filters” text; keep `aria-label="Filters"`; badge unchanged
2. **Sort button** (icon-only): immediately **left** of Filters when Filters is shown; on ≥1280, Sort remains in the search toolbar (Filters button still hidden per 058)
3. Toolbar cluster order: **Sort → Filters** (when both visible), right side of the search row
4. **Sort sheet** mirrors Filters sheet sides:
   - Mobile: bottom
   - Tablet / &lt;1280 wide enough for right sheet: right (same breakpoint rule as Filters)
   - ≥1280: Sort opens a **right** sheet (Filters stay always-on drawer; no always-on Sort panel)
5. **Sort modes** (single select; applying a mode updates the list **immediately** and closes the sheet):

   | Id (suggested) | Label | Order |
   |----------------|-------|--------|
   | `createdAt-desc` | Default | `createdAt` newest first |
   | `occurredOn-desc` | Date (descending) | `occurredOn` newest first |
   | `occurredOn-asc` | Date (ascending) | `occurredOn` oldest first |
   | `category` | Categories | See domain rules |

6. Remove table-header date-cycle sort UI (depends on 063 list)

### Out of scope

- Always-on Sort drawer on xl
- Changing filter criteria / Apply-Clear model
- Persisting sort mode across sessions (session/runtime state is enough unless already patterned otherwise — **default: not persisted**)

## Domain rules

- **Default / date modes:** same comparisons as today’s `sortTransactionsByDate` for the three date/create modes; tie-break `id`
- **Categories mode:**
  1. Income categories before expense categories
  2. Within each type, order by category `sortOrder` ascending (set ordering)
  3. Uncategorized (`categoryId == null`) last
  4. Within the same category: `createdAt` descending, then `id`
- Sort applies to the **already filtered** Activity result set

## Acceptance scenarios

### Scenario: Icon-only Filters

- **Given** Activity at viewport width &lt; 1280
- **When** the toolbar renders
- **Then** `activity-filters-open` is visible
- **And** it has no visible “Filters” text (icon + accessible name only)

### Scenario: Sort left of Filters

- **Given** Activity at viewport width &lt; 1280
- **When** the toolbar renders
- **Then** Sort control is immediately left of Filters

### Scenario: Sort sheet sides

- **Given** Activity on a mobile-width viewport
- **When** the user opens Sort
- **Then** a bottom sheet lists the four sort options

- **Given** Activity on a tablet-width viewport (&lt; 1280)
- **When** the user opens Sort
- **Then** a right sheet lists the four sort options

### Scenario: Select Categories sort

- **Given** filtered Activity rows spanning multiple categories
- **When** the user selects Categories in Sort
- **Then** rows order by income categories (set order), then expense (set order), then uncategorized
- **And** the Sort sheet closes

### Scenario: xl Sort without Filters button

- **Given** Activity at viewport width ≥ 1280
- **When** the toolbar renders
- **Then** Sort icon is available
- **And** `activity-filters-open` is not shown
- **And** opening Sort shows a right sheet

## Traceability

- Vitest: `src/lib/domain/activity-filters.test.ts`
- Playwright: `e2e/activity-filters.e2e.ts` (extend) and/or `e2e/activity-sort.e2e.ts`
- Implementation: `src/lib/domain/activity-filters.ts`, `src/lib/ui/AppShellChrome.svelte`, Activity list consumer

## Related

- Spec 058 (always-on filters drawer on xl — unchanged)
- Spec 063 (Activity list; removes table header sort)
- Spec 045 / 049 (filters sheet sides / draft model)
