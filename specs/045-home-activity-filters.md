# Spec 045: Home polish and Activity filters overhaul

- **ID:** 045
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Polish Home chrome and amount privacy; overhaul Activity filters into a draft/apply flow with responsive sheet/drawer surfaces, richer filter/sort options, and clearer toolbar layout.

## Scope

### In scope — Home

1. **Title icons** — Balance and Recent card titles include icons
2. **Month summary** — Income / **Expenses** tile labels (Expense → Expenses); icons on Income and Expenses tiles
3. **Amount visibility** — toolbar control show/hide money values on Home (Balance, Recent amounts, Month summary figures) for the current session only (not persisted)

### In scope — Activity layout

4. **Search** — search section has an icon
5. **Add placement** — Add sits **below** the search bar
6. **Filters control** — all advanced filters collapse into a single Filters button (no always-visible desktop filter grid)

### In scope — Filter contents

7. **Hide voided** — option to exclude voided transactions
8. **Amount filters** — less-than and/or greater-than amount (digits / minor units), alongside existing type/category/dates
9. **Date column sort** — clicking Date header cycles: **createdAt newest-first (default)** → **occurredOn descending** → **occurredOn ascending**

### In scope — Filter surfaces and apply model

10. **Responsive surfaces**
    - `< 768px`: bottom sheet
    - `768–1279px`: right sheet (overlay)
    - `≥ 1280px`: right collapsible drawer (own expand/collapse state, independent of nav drawer)
11. **Draft vs applied** — edits in the surface are draft; list uses applied filters only after **Apply**
12. **Apply** — footer button label **Apply** (was Done); disabled when draft equals applied
13. **Close** — footer **Close** replaces Clear in the footer; closing without Apply discards draft visually on next open (re-sync from applied) unless dirty-close warn applies
14. **Dirty close warn** — if draft ≠ applied and user closes (Close, outside, Escape), ConfirmDialog warns changes will not be applied; decline keeps surface open
15. **Clear** — header icon button with label **Clear**; enabled only when draft ≠ defaults; resets draft to defaults (Apply still required to commit)
16. **Filters button badge / affordance** — reflect when **applied** filters are non-default
17. **Session only** — applied/draft filters are not persisted across reloads
18. **Sheet headers** — Filters header includes icons

### Out of scope

- Persisting filters or amount-hide across sessions
- Spec 043 Uncategorized icon details (shared component may be used)
- Spec 046 Categories toast removal

## Domain rules

- Defaults: type `all`, category all, no dates, search empty, voided shown, no amount lt/gt
- Amount compare uses integer minor units from digit input (same parse rules as amounts elsewhere)
- Sort: default `createdAt` desc; then `occurredOn` desc; then `occurredOn` asc (stable by id if needed)

## Acceptance scenarios

### Scenario: Home amount hide

- **Given** Home with a non-zero balance
- **When** the user toggles hide amounts
- **Then** Balance, Recent amounts, and Month summary figures are hidden; toggle again restores them

### Scenario: Add below search

- **Given** Activity
- **When** the toolbar renders
- **Then** Add is below the search field

### Scenario: Apply required

- **Given** Filters open with draft type Expense while applied is All
- **When** the user closes without Apply and confirms the warn
- **Then** the list still shows All; reopening Filters shows draft reset from applied

### Scenario: Apply commits

- **Given** draft type Expense and Apply enabled
- **When** the user activates Apply
- **Then** the list filters to expenses and the surface closes (or stays closed)

### Scenario: Date header cycle

- **Given** Activity with multiple txs
- **When** the user clicks Date repeatedly
- **Then** order cycles createdAt-desc → occurredOn-desc → occurredOn-asc

### Scenario: Hide voided

- **Given** a voided and an active transaction
- **When** hide-voided is applied
- **Then** only the active transaction remains in the list

### Scenario: Large screen drawer

- **Given** viewport ≥ 1280px
- **When** Filters opens
- **Then** filters appear in a right collapsible drawer (not a bottom sheet)

## Traceability

- Vitest: activity-filters void/amount; sort helper if extracted
- Playwright: Apply/Clear/dirty warn; Add position; date sort; amount hide; breakpoints smoke
- Implementation: `AppShellChrome.svelte`; `ActivityTable.svelte`; `activity-filters.ts`; `MonthSummary.svelte`
- Depends on: 017, 020, 035, 041 (ConfirmDialog)
- Supersedes in part: 020 always-visible desktop filter grid; Done/Clear footer layout
