# Spec 031: Month summary Net sign coloring

- **ID:** 031
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Color month-summary Net by sign so it matches Income (positive) and Expense (negative) cues.

## Scope

### In scope

- Cashflow Net tile (`data-testid="month-net"`) and footer Net (`data-testid="month-footer-net"`)
- `netMinor > 0` → emerald (`text-emerald-600 dark:text-emerald-400`)
- `netMinor < 0` → `text-destructive`
- `netMinor === 0` → `text-muted-foreground`
- Amount formatting unchanged

### Out of scope

- Opening / Ending colors
- Balance hero or Activity amounts
- Domain math

## Domain rules

- None

## Acceptance scenarios

### Scenario: Positive net

- **Given** month net is positive
- **When** the month summary renders
- **Then** both Net values use the emerald/income color cue

### Scenario: Negative net

- **Given** month net is negative
- **When** the month summary renders
- **Then** both Net values use the destructive/expense color cue

### Scenario: Zero net

- **Given** month net is zero
- **When** the month summary renders
- **Then** both Net values use muted foreground

## Traceability

- Vitest: n/a
- Playwright: `e2e/month-charts.e2e.ts` (class asserts)
- Implementation: `src/lib/ui/MonthSummary.svelte`
- Depends on: 002, 028
