# Spec 043: Dates DD MMM YYYY, Uncategorized marker, month chart order

- **ID:** 043
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Unify dates to `DD MMM YYYY`, mark system Uncategorized distinctly from a user-named category, align month breakdown order with the Categories menu, and make chart rows hoverable.

## Scope

### In scope

1. **Date format** — always `DD MMM YYYY` (e.g. `2026-06-16` → `16 Jun 2026`); English month abbrev; zero-padded day; four-digit year
2. **Lists / DateField** — Recent, Activity, DateField visible value use the new format (storage remains ISO `YYYY-MM-DD`)
3. **Pointer cursor** — interactive controls (buttons, dropdowns, datepickers, clickable rows/headers) use `cursor: pointer`; disabled use `cursor: not-allowed`
4. **System Uncategorized marker** — when `categoryId` is `null`, show a shared icon (e.g. CircleDashed) beside the label **Uncategorized**; a user category whose name is literally `"Uncategorized"` has **no** system icon
5. **Surfaces for the marker** — Recent, Activity table, month category charts, tx category dropdown, Activity category filter option
6. **Month chart order** — within Income and within Expenses, categories follow Categories menu `sortOrder`; **Uncategorized** last in each type
7. **Chart hover** — hovering a category label or its bar highlights the corresponding row (label + bar)

### Out of scope

- Spec 044 tx chrome / outside-click restore
- Spec 045 Activity filter surfaces
- Spec 046 Categories padding / toast removal

## Domain rules

- Storage: `YYYY-MM-DD`
- Display: `DD MMM YYYY` via `formatOccurredOnDisplay` (supersedes Spec 042 `YY Mon DD`)
- System Uncategorized ↔ `categoryId === null` only
- Month breakdown sort: `sortOrder` ascending, then name; empty category key last

## Acceptance scenarios

### Scenario: Date format

- **Given** a transaction on `2026-06-16`
- **When** Activity or Recent shows it
- **Then** the date reads `16 Jun 2026`

### Scenario: System Uncategorized icon

- **Given** a transaction with `categoryId` null
- **When** it appears in Recent or Activity
- **Then** Uncategorized is shown with the system icon

### Scenario: Named Uncategorized has no icon

- **Given** a user category named `Uncategorized`
- **When** a transaction uses that category id
- **Then** the label has no system Uncategorized icon

### Scenario: Month order matches Categories

- **Given** expense categories ordered B then A in Categories, plus uncategorized spend
- **When** Expenses by category renders
- **Then** bars follow B, A, then Uncategorized last

### Scenario: Chart hover highlights row

- **Given** a month chart with multiple categories
- **When** the user hovers a bar or its label
- **Then** that category’s label and bar are highlighted together

## Traceability

- Vitest: `occurred-on-display.test.ts`; month-summary order
- Playwright: date text; Uncategorized icon testid; optional chart hover
- Implementation: `occurred-on-display.ts`; `month-summary.ts`; `UncategorizedLabel.svelte` (or helper); `CategoryBreakdownChart.svelte`; `app.css`
- Depends on: 038 (`sortOrder`), 042 (supersedes display)
- Supersedes: Spec 042 date display format
