# Plan 065: Active Sort/Filters icon chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 064 (icon Sort/Filters)

## Why

When sort or filters differ from defaults, the icon buttons should read as “on” — primary-tinted outline — without becoming solid filled primary or losing the outline look.

## Scope / edges

**In:** Sort icon + Filters icon (when shown) switch to primary-outline styling when non-default; Filters badge unchanged.

**Out:** Changing when filters count as advanced; solid primary fill; xl always-on drawer chrome.

## Approach

- `AppShellChrome`: derived `sortActive` / reuse `hasAdvancedFilters`; conditional `class` (or outline + primary border/text/bg-primary/10) on the two icon buttons
- Playwright: assert class/role when mode/filters applied

## TDD

- Playwright: extend `e2e/activity-filters.e2e.ts`
