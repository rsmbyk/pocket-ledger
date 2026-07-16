# Spec 029: More panel — one card per row

- **ID:** 029
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Improve More (settings) layout by stacking every section card full-width, one per row, instead of a multi-column grid.

## Scope

### In scope

- Replace `md:grid-cols-2` / `xl:grid-cols-3` with a single vertical stack (`flex flex-col gap-4` or equivalent)
- Each existing More card remains full width
- Container testid: `more-sections` (replace `more-desktop-grid` if present); update e2e references

### Out of scope

- Reordering sections
- Reset / backup / lock behavior changes
- Categories panel layout

## Domain rules

- None

## Acceptance scenarios

### Scenario: Single column on wide viewport

- **Given** a desktop-width viewport on More
- **When** the panel renders
- **Then** Backup, Recurring, Goals, Net worth, and Lock cards stack vertically (one card per row), not side-by-side

## Traceability

- Vitest: n/a
- Playwright: update layout asserts if any
- Implementation: `src/lib/ui/MorePanel.svelte`
- Depends on: 008, 013
