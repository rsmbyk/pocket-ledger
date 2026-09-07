# Spec 235: Pocket details layout

- **ID:** 235
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Pocket details is a **three-column dashboard on xl** (≥1280). Below that it stays a single `max-w-3xl` stack, with Opening next to the derived balance (before Plans).

## Scope

### In scope

1. **Narrow (&lt;1280)** — one column, `max-w-3xl`, stage page-scroll. Card order: Descriptions (if notes) → Balance → Opening (if `openingEnabled`) → Plans → Goals → Month summary → Recent.
2. **Wide (≥1280)** — drop the `max-w-3xl` island; details use the full main inset. Three **equal-width** columns (`1fr 1fr 1fr`, `min-w-0`, `gap-4`). The stage fills under the title bar and **does not scroll**; each column does (`min-h-0 overflow-y-auto`).
   - Left (`pocket-details-col-identity`): Descriptions (if notes), Balance, Opening (if enabled)
   - Mid (`pocket-details-col-activity`): Month summary, Recent
   - Right (`pocket-details-col-lists`): Plans, Goals
3. Missing description or opening still omits those cards. Other cards, copy, testids, and actions are unchanged.

### Out of scope

- Home layout (238)
- Pockets list
- Money rules, Plans/Goals/Recent behavior
- Changing the xl breakpoint (stays 1280)

## Domain / UI rules

- Breakpoint matches 234 (`min-width: 1280px`).
- **Supersedes 148** “single-column Home stage, `max-w-3xl`” **on xl only**, and 148 out-of-scope “2-column dashboard”.
- **Supersedes 223** item 6 “Plans after the balance hero” on pocket details: Plans sit with Goals; on the narrow stack they follow Opening.

## Acceptance scenarios

### Scenario: Narrow stack Opening before Plans

- **Given** pocket details with opening enabled at viewport width &lt; 1280
- **When** the panel renders
- **Then** `pocket-details-opening` is above `pocket-details-plans-card`
- **And** `pocket-details-plans-card` is above `pocket-details-goals-card`
- **And** `pocket-details-goals-card` is above month summary
- **And** month summary is above `pocket-details-recent-card`
- **And** the three column testids are absent (or not laid out as columns)

### Scenario: Xl three equal columns

- **Given** pocket details at viewport width ≥ 1280
- **When** the panel renders
- **Then** `pocket-details-col-identity`, `pocket-details-col-activity`, and `pocket-details-col-lists` are visible left to right
- **And** the three columns have equal width
- **And** identity contains Balance (and Descriptions / Opening when those cards exist)
- **And** activity contains month summary then Recent
- **And** lists contains Plans then Goals

### Scenario: Xl columns scroll independently

- **Given** pocket details on xl with enough content in one column
- **When** that column is scrolled
- **Then** the other columns stay put
- **And** the page title bar stays visible

## Traceability

- Vitest: none required
- Playwright: `e2e/pocket-details.e2e.ts`
- Implementation: `PocketDetailsPanel.svelte`; `AppShellChrome.svelte` wide stage + inset overflow when details is showing on xl

## Related

- 148, 223, 234; Home columns in 238
