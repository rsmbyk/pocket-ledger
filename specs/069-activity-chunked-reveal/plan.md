# Plan 069: Activity chunked reveal (whole days)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 068 (date groups)

## Why

Long Activity lists should not mount every row at once. Reveal in chunks, and never split a calendar day when date-grouped.

## Scope / edges

**In:** In-memory chunked reveal; whole-day bundles for date sorts; row chunks for Default; reset on filter/sort/search change.

**Out:** IndexedDB paging; third-party virtualizers.

## Approach

- Pure helper: `nextRevealEndIndex(sorted, currentEnd, mode, targetSize)` — TDD heavily
- UI: sentinel + IntersectionObserver in Activity list
- Target size ~40 rows (tunable constant)

## TDD

- **Red Vitest first** for reveal window helper:
  - Default: grow by ~target rows
  - Date sort: never end mid-day; may exceed target to finish a day; single oversized day loads fully
  - Idempotent / clamped at list end
- **Green** helper
- **Red/green Playwright:** scroll/sentinel reveals more; after Date sort, no partial day in DOM for a header’s group (spot-check with seeded multi-day data)
