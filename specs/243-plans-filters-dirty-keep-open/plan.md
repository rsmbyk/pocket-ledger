# Plan 243: Plans filters dirty leave keep-open

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 080, 085
- **Related:** 223 (Plans filters sheet; no prevent-then-warn)

## Why

Dirty leave on the Plans filter sheet opens discard, but bits-ui already closed the sheet. Keep editing leaves `plansFiltersOpen === true` while the UI is gone, so Filters no-ops.

Activity filters already prevent-then-warn. Plans copied refuse-`open = false` on `onOpenChange` and never `preventDefault` on overlay/Escape.

## Approach

Mirror Activity’s `onFiltersDismissAttempt` as `onPlanFiltersDismissAttempt` on `plans-filters-sheet`: `preventDefault` while dirty or while discard is open; ignore floating menus and native pickers. Keep `onPlanFiltersOpenChange` as the refuse-`open = false` backstop.

## TDD

Playwright at a mobile viewport: dirty overlay/Escape keep the sheet + discard; Keep editing; Discard then reopen; clean overlay/Escape still close.
