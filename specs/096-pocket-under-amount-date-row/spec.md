# Spec 096: Pocket under amount, date-aligned

- **ID:** 096
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When `showPocket` is on and secondary is date, the pocket (or transfer source → dest) sits **under the amount**, on the **same horizontal band as the date**. Optional note stays **between title and date** on the left.

Target layout:

```
[Title / Transfer     ] [amount]
[note if any          ]
[date                 ] [pocket]
```

## Scope

### In scope

1. Move pocket chrome from the left date flex into the amount column under the amount
2. `secondary === 'date'`: left = title → note (if any) → date; right = amount → pocket
3. `secondary === 'note'`: note on left; pocket under amount when `showPocket`
4. `secondary === 'none'` + `showPocket`: pocket under amount only
5. Keep testids `${testid}-date` / `${testid}-note` / `${testid}-pocket`; transfer chrome unchanged
6. Home Recent + Activity

### Out of scope

- Amount colors / primary title
- When `showPocket` is passed
- Filter changes

## Acceptance scenarios

### Scenario: Date + pocket under amount

- **Given** a Recent or Activity row with date secondary and showPocket
- **When** it renders
- **Then** the pocket testid is under the amount (right column), the date is on the left secondary band without a pocket sibling, and when a note is present it appears between the title and the date

### Scenario: Note secondary with pocket

- **Given** a row with note secondary and showPocket
- **When** it renders
- **Then** the note is on the left and the pocket is under the amount

## Traceability

- Implementation: `src/lib/ui/TransactionListRow.svelte`
- Playwright: pockets / activity row smoke as needed
- Revises: 092; hardens 076, 077

## Related

- 076, 077, 092
