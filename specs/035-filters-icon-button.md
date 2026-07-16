# Spec 035: Icon-only Activity Filters button

- **ID:** 035
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Mobile Activity Filters control is icon-only, consistent with other chrome icon actions.

## Scope

### In scope

- Filters trigger (`data-testid="activity-filters-open"`): `size="icon"`, SlidersHorizontal icon, no “Filters” text
- `aria-label="Filters"`
- Active-filter badge unchanged
- Sheet contents and desktop filter grid unchanged

### Out of scope

- Filter semantics (017 / 020)

## Domain rules

- None

## Acceptance scenarios

### Scenario: Icon opens sheet

- **Given** Activity on a narrow viewport
- **When** the user activates the filters control
- **Then** the filters sheet opens; the control has accessible name Filters and no visible “Filters” label

## Traceability

- Vitest: n/a
- Playwright: `e2e/activity-filters.e2e.ts` (testid click)
- Implementation: `src/lib/ui/AppShellChrome.svelte`
- Depends on: 020
