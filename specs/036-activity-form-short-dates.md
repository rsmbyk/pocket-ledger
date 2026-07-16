# Spec 036: Short dates on Activity and transaction form

- **ID:** 036
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Use month-abbrev short dates on Activity; on the transaction form, show that format **with year always**.

## Scope

### In scope

- Extend `formatOccurredOnDisplay` with `year?: 'auto' | 'always'` (`auto` = default Spec 026 behavior)
- Activity date column: `year: 'auto'`
- Transaction sheet: keep `type="date"` input; show muted readout with `year: 'always'` (`data-testid="tx-occurred-on-display"`)

### Out of scope

- Replacing the native date picker
- Filter From/To inputs
- Spec 037 sheet chrome (may coexist)

## Domain rules

- Storage remains ISO `YYYY-MM-DD`
- `always` → `Mon DD, YYYY`; `auto` omits year when same calendar year as today

## Acceptance scenarios

### Scenario: Activity omits current year

- **Given** a tx dated this year
- **When** Activity lists it
- **Then** the date column shows `Mon DD` without year

### Scenario: Form readout always has year

- **Given** the add/edit sheet with a date set
- **When** the form renders
- **Then** `tx-occurred-on-display` includes the year

## Traceability

- Vitest: `occurred-on-display.test.ts`
- Playwright: optional Activity / sheet asserts
- Implementation: domain helper; `ActivityTable.svelte`; `QuickAddSheet.svelte`
- Depends on: 026
