# Spec 020: Activity filters — mobile compact layout

- **ID:** 020
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

On small screens, Activity filters must not dominate the viewport. Keep search reachable; tuck type/category/dates behind a Filters control.

## Scope

### In scope

- **Mobile (`< md`, Tailwind 768px):** Activity chrome shows:
  - Search field (always visible)
  - **Filters** button that opens a bottom sheet with Type, Category, From, To
  - Badge on the button when any advanced filter is active (type ≠ All, or category/date set); search does not count toward the badge
  - Sheet actions: **Clear** (advanced filters only) and **Done** (close)
- **Desktop (`md+`):** keep the always-visible filter grid from Spec 017
- Same filter criteria, domain helper, and testids for controls (mobile: advanced controls live in the sheet)

### Out of scope

- Changing filter semantics or search matching
- Saved presets
- Home Recent filters

## Acceptance scenarios

### Scenario: Mobile keeps list visible

- **Given** Activity on a narrow viewport
- **When** the page loads
- **Then** search + Filters button are visible and the transaction list is not pushed mostly off-screen by a tall filter stack

### Scenario: Mobile advanced filters in sheet

- **Given** Activity on mobile
- **When** the user opens Filters, sets Type to Expense, and taps Done
- **Then** the list shows only expenses and the Filters badge reflects an active filter

### Scenario: Desktop unchanged

- **Given** Activity at `md+`
- **When** the page loads
- **Then** type, category, dates, and search remain visible in the filter grid without opening a sheet

## Traceability

- Playwright: extend `e2e/activity-filters.e2e.ts` (desktop path + mobile sheet path)
- Implementation: `AppShellChrome.svelte` Activity chrome
- Depends on: Spec 017
