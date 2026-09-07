# Spec 238: Home xl two columns

- **ID:** 238
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **xl** (≥1280), Home is a **two-column dashboard**: money summary on the left, lists on the right. Below xl it stays the current `max-w-3xl` stack.

## Scope

### In scope

1. **Narrow (&lt;1280)** — unchanged: Balance → Plans (if any, 223) → Month → Recent, `max-w-3xl`, stage page-scroll.
2. **Wide (≥1280)** — drop the island; Home uses the full main inset. Two **equal-width** columns (`1fr 1fr`, `min-w-0`, `gap-4`). The stage fills under the title bar and **does not scroll**; each column does.
   - Left (`home-col-summary`): Balance, Month summary
   - Right (`home-col-lists`): Plans (still hidden when empty), Recent
3. No new cards. Hide-amounts, month cursor, Add, See more unchanged.

### Out of scope

- Pocket details (235)
- Recent row cap (236)
- Changing the xl breakpoint

## Domain / UI rules

- Breakpoint matches 234 / 235.
- **Supersedes 013** Home as a single centered column **on xl only**.
- Plans still hide when empty (223).

## Acceptance scenarios

### Scenario: Narrow stack unchanged

- **Given** Home at viewport width &lt; 1280 with at least one Plan in the 1-week window
- **When** Home renders
- **Then** Balance is above Plans, Plans above Month, Month above Recent
- **And** `home-col-summary` / `home-col-lists` are not laid out as columns

### Scenario: Xl two equal columns

- **Given** Home at viewport width ≥ 1280
- **When** Home renders
- **Then** `home-col-summary` is left of `home-col-lists`
- **And** the two columns have equal width
- **And** summary contains Balance then Month
- **And** lists contains Plans (if any) then Recent

### Scenario: Xl columns scroll independently

- **Given** Home on xl with enough Recent rows to overflow
- **When** the lists column is scrolled
- **Then** the summary column stays put
- **And** the page title bar stays visible

## Traceability

- Vitest: none required
- Playwright: `e2e/desktop-layout.e2e.ts`
- Implementation: `home-panel` in `AppShellChrome.svelte`; wide stage + inset overflow when Home + xl

## Related

- 013, 223, 234, 235
