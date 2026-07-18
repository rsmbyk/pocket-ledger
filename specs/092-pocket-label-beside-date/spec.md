# Spec 092: Pocket label beside date

- **ID:** 092
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When `showPocket` is on, the pocket (or transfer source → dest) shares the **date** secondary row — not under the amount.

## Scope

### In scope

1. Remove pocket from the amount column
2. `secondary === 'date'`: one muted row with date + pocket (keep date + pocket testids)
3. `secondary === 'note'`: pocket with note when present; else pocket alone
4. `secondary === 'none'`: pocket as muted line under title
5. Transfer arrow + PocketLabels unchanged; Home Recent + Activity

### Out of scope

- Amount colors / primary title
- Filter changes

## Acceptance scenarios

### Scenario: Date + pocket

- **Given** a Recent or Activity row with date secondary and showPocket
- **When** it renders
- **Then** pocket testid is on the same row as the date, and the amount column has no pocket line

## Traceability

- Implementation: `TransactionListRow.svelte`
- Playwright: pockets / activity row smoke
- Hardens: 077, 076

## Related

- 076, 077
