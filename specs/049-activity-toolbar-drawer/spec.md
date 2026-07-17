# Spec 049: Activity toolbar, drawer, sort icons, Clear

- **ID:** 049
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Finish Activity chrome from Spec 045: restore Filters beside search, right-align Add, ship a real large-screen filters drawer, make date-sort modes visually distinct, and give Clear clear outline affordance.

## Scope

### In scope

1. **Toolbar** — Filters control sits to the **right of** the search field (same row)
2. **Add** — Add remains **below** search; horizontally **right-aligned**
3. **≥1280 drawer** — Filters open as an in-layout right drawer (`data-testid="activity-filters-drawer"`) that is not a modal Sheet overlay; no dimming scrim that blocks the page
4. **&lt;1280 surfaces** — keep bottom sheet (&lt;768) and right overlay sheet (768–1279) with existing Apply / Close / Clear / dirty-warn behavior
5. **Date sort icons** — `createdAt-desc` uses a distinct icon from `occurredOn-desc`; asc uses an up/asc affordance
6. **Clear** — header Clear uses visible **outline** button chrome (neutral, not destructive)

### Out of scope

- Changing filter fields or Apply semantics
- Amount hide (048)
- Label inertness on filter fields (optional follow-up; not required here)

## Domain rules

- Date sort cycle unchanged: `createdAt-desc` → `occurredOn-desc` → `occurredOn-asc`
- Draft vs applied filter model unchanged from 045

## Acceptance scenarios

### Scenario: Filters beside search

- **Given** Activity
- **When** the toolbar renders
- **Then** search and Filters share one row with Filters on the right, and Add is on the next row aligned to the right

### Scenario: Large-screen drawer

- **Given** viewport width ≥ 1280
- **When** the user opens Filters
- **Then** `activity-filters-drawer` is present in layout (not only as a portaled sheet with blocking overlay)

### Scenario: Sort icons differ

- **Given** Activity table with the default date sort
- **When** the user cycles Date once to occurredOn descending
- **Then** the header icon (or testid) differs from the default createdAt mode

### Scenario: Clear outline

- **Given** Filters open with a non-default draft
- **When** Clear is enabled
- **Then** Clear renders with outline button chrome

## Traceability

- Vitest: none (or `src/lib/domain/activity-date-sort-icon.test.ts` if helper extracted)
- Playwright: `e2e/activity-filters.e2e.ts` (extended); optional `e2e/activity-toolbar.e2e.ts`
- Implementation: (pending Accept)

## Related

- Delivers Spec 045 items 5–6 and 10 (≥1280 drawer) as originally intended
