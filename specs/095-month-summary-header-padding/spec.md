# Spec 095: Month summary header padding

- **ID:** 095
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Month summary card header has the **same top and bottom padding**.

## Scope

### In scope

1. [`MonthSummary.svelte`](../../src/lib/ui/MonthSummary.svelte) `Card.Header`: equal vertical padding (e.g. keep `py-3` / explicit `pt-3 pb-3`)
2. Ensure shared Card.Header defaults do not make bottom padding differ on this header (override if needed)

### Out of scope

- Changing month nav behavior or title copy
- Global Card.Header redesign for all cards

## Acceptance scenarios

### Scenario: Equal padding

- **Given** Home month summary card
- **When** the header (July 2026 / Month summary + chevrons) renders
- **Then** top and bottom padding of the header box match

## Traceability

- Implementation: `MonthSummary.svelte` (+ Card.Header class override if required)

## Related

- Month summary UI
