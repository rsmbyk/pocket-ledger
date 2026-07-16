# Spec 028: Month summary section dividers

- **ID:** 028
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Make the Home month summary card easier to scan with clear visual breaks between major sections.

## Scope

### In scope

- Dividers between: month header, cashflow totals, income-by-category, expenses-by-category, opening/net/ending
- Full-width hairline (`border-t border-border`) above sections after the header, with modest vertical padding
- Existing border tokens only; no new colors or data changes

### Out of scope

- New charts or copy
- Dividers on balance / Recent cards
- Domain rules

## Domain rules

- None

## Acceptance scenarios

### Scenario: Sections are visually separated

- **Given** the Home month summary card with data
- **When** the user views the card
- **Then** cashflow, each category breakdown, and the opening/ending block are separated by clear horizontal rules (not a single undivided stack)

## Traceability

- Vitest: n/a
- Playwright: optional `month-summary` still visible
- Implementation: `src/lib/ui/MonthSummary.svelte`
- Depends on: 002, 013
