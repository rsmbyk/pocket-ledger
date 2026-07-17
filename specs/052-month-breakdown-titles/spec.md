# Spec 052: Month breakdown titles

- **ID:** 052
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Shorten Home month breakdown chart titles from “Income by category” / “Expenses by category” to **Income** / **Expenses**.

## Scope

### In scope

1. Rename the two by-category breakdown titles on Home month summary

### Out of scope

- Chart bars, sort order, icons (048)
- Amount hide (048)
- Sum tiles “Income” / “Expenses” wording (already short)

## Domain rules

- None

## Acceptance scenarios

### Scenario: Short chart titles

- **Given** Home month summary with by-category sections
- **When** the sections render
- **Then** the income breakdown title is “Income” (not “Income by category”)
- **And** the expense breakdown title is “Expenses” (not “Expenses by category”)
- **And** kind icons from Spec 048 remain on those titles

## Traceability

- Vitest: none
- Playwright: `e2e/month-charts.e2e.ts` (extend if needed)
- Implementation: `src/lib/ui/MonthSummary.svelte`

## Related

- Spec 048 (icons on by-category titles)
- Spec 043 (month order)
