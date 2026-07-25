# Plan 101: Activity date sort secondary by createdAt

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 064/067 (sort modes); Spec 068 (within-day order preserved)

## Why

When Activity is sorted by `occurredOn` asc/desc, same-day rows currently tie-break only by `id`, so creation time is ignored. Users expect same-day order to follow the same direction as the date sort (newest-created first when dates descend, oldest-created first when dates ascend).

## Scope / edges

**In:** Domain `sortTransactions` secondary key for `occurredOn-desc` / `occurredOn-asc` only; Vitest coverage for same-day ordering.

**Out:** Changing Default (`createdAt-desc`) tie-break; Sort sheet UI/copy; filter persistence (Spec 102); group headers / chunked reveal rules.

## Approach

- TDD: same-day fixtures with distinct `createdAt` values under both date modes
- Update `sortTransactions` comparator: after `occurredOn`, compare `createdAt` in the same direction, then `id`
- Leave `createdAt-desc` path unchanged

## TDD

- Vitest: `src/lib/domain/activity-filters.test.ts`
- Playwright: optional smoke only if list order is already asserted for date sorts; not required if Vitest covers the rule
