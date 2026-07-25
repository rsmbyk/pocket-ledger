# Spec 101: Activity date sort secondary by createdAt

- **ID:** 101
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When sorting Activity by date, order transactions that share the same `occurredOn` by `createdAt` using the **same direction** as the date sort (desc with desc, asc with asc). Final tie-break remains `id`.

## Scope

### In scope

1. `occurredOn-desc`: primary `occurredOn` descending → secondary `createdAt` descending → then `id`
2. `occurredOn-asc`: primary `occurredOn` ascending → secondary `createdAt` ascending → then `id`
3. Domain helper + Vitest for same-day ordering

### Out of scope

- Changing Default sort (`createdAt-desc`) beyond existing `createdAt` then `id`
- Sort sheet labels / chrome
- Session persistence of sort/filters (Spec 102)
- Changing date group headers or chunked reveal (068 / 069) — they keep relative order from `sortTransactions`

## Domain rules

- Applies only to `ActivitySortMode` values `occurredOn-desc` and `occurredOn-asc`
- `createdAt-desc` unchanged: `createdAt` descending, then `id`
- Comparisons use ISO string `localeCompare` (same as today)
- Supersedes Spec 064’s “tie-break `id`” for **date modes only** (after the new `createdAt` secondary)

## Acceptance scenarios

### Scenario: Date descending — same day by createdAt desc

- **Given** two transactions with the same `occurredOn` and different `createdAt` values
- **When** Sort is Date (descending)
- **Then** the row with the newer `createdAt` appears before the older one
- **And** both still appear under that day’s group (when date grouping is active)

### Scenario: Date ascending — same day by createdAt asc

- **Given** the same two same-day transactions
- **When** Sort is Date (ascending)
- **Then** the row with the older `createdAt` appears before the newer one

### Scenario: Different days still win

- **Given** one transaction on a later `occurredOn` with an older `createdAt`, and one on an earlier day with a newer `createdAt`
- **When** Sort is Date (descending)
- **Then** the later `occurredOn` still sorts first (primary key unchanged)

### Scenario: Default sort unchanged

- **Given** mixed `occurredOn` values
- **When** Sort is Default
- **Then** order remains `createdAt` descending, then `id` (no date primary)

## Traceability

- Vitest: `src/lib/domain/activity-filters.test.ts` (TDD first)
- Playwright: optional — only if extending existing date-sort order checks in `e2e/activity-filters.e2e.ts`
- Implementation: `src/lib/domain/activity-filters.ts` (`sortTransactions`)

## Related

- Spec 064, 067, 068, 069
- Spec 102 (session persistence — separate concern)
