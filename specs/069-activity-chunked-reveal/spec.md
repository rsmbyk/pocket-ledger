# Spec 069: Activity chunked reveal (whole days)

- **ID:** 069
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Lazily reveal Activity rows in chunks from the already-filtered in-memory list. When date-grouped, each chunk must load **complete days only** — never leave a day half-loaded.

## Scope

### In scope

1. Chunked reveal with bottom sentinel (IntersectionObserver or equivalent)
2. **Default sort:** grow visible window by ~40 rows per bundle
3. **Date asc/desc:** grow by whole `occurredOn` days until the bundle reaches ~40 rows **or** at least one full day if that day alone exceeds ~40
4. Reset visible window when applied filters, search, or sort mode change
5. Pure domain/application helper for computing the next end index (unit-tested)

### Out of scope

- Fetching pages from IndexedDB
- Adding a virtualization library
- Changing filter/sort semantics

## Domain rules

- Input = fully sorted/filtered array; output = end index (exclusive) into that array
- Date modes: if adding the next day would be needed mid-bundle, include **all** txs with that `occurredOn` before stopping
- Never return an end index that splits a day’s contiguous run under date sort
- End index ≤ length; further reveals no-op when fully shown

## Acceptance scenarios

### Scenario: Default grows by rows

- **Given** Default sort and 100 txs
- **When** the list first renders
- **Then** about 40 rows are shown
- **And** revealing more adds about 40 more (until exhausted)

### Scenario: Date sort never splits a day

- **Given** Date (descending) sort with day A (10 txs) then day B (50 txs)
- **When** the first bundle is computed with target 40
- **Then** the first bundle includes **all** of day A and **all** of day B (because B cannot be partial; exceeding target is required)
- **And** no date header’s group is only partially present in the visible window

### Scenario: Reset on sort change

- **Given** the user has revealed deep into the list
- **When** they change Sort mode
- **Then** the visible window resets to the first bundle for the new mode

## Traceability

- Vitest: reveal-window helper (TDD first) — e.g. `activity-reveal.test.ts`
- Playwright: Activity scroll/sentinel + date-group integrity spot check
- Implementation: helper + `ActivityTable.svelte` / `AppShellChrome.svelte`

## Related

- Spec 068 (date groups)
- Spec 067 (sort modes)
