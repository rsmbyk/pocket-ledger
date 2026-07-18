# Spec 098: Pocket bottom-aligned when note present

- **ID:** 098
- **Status:** Superseded by [099](../099-amount-pocket-center-stack/spec.md)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Hardens **096**. When a date-secondary row has a **note** and `showPocket`, the pocket (under the amount) sits on the **same horizontal band as the date** — not beside the note.

Target when note + showPocket + `secondary === 'date'`:

```
[Title / Transfer     ] [amount]
[note                 ]
[date                 ] [pocket]
```

Without a note, amount → pocket stays tight (already date-aligned).

## Scope

### In scope

1. When `secondary === 'date'` and a note is present and `showPocket`: amount column stretches; pocket is bottom-aligned in that column
2. Keep pocket under the amount (right column); keep testids
3. Home Recent + Activity

### Out of scope

- `secondary === 'note'` (no date band)
- Amount colors / when `showPocket` is passed
- Changing note/date left-column order

## Acceptance scenarios

### Scenario: Note + date + pocket

- **Given** a Recent or Activity row with date secondary, a non-empty note, and showPocket
- **When** it renders
- **Then** the pocket testid is under the amount and on the same horizontal band as the date (below the note), not beside the note

### Scenario: Date + pocket, no note

- **Given** a date-secondary row with showPocket and no note
- **When** it renders
- **Then** the pocket remains directly under the amount on the date band (096 behavior unchanged)

## Traceability

- Implementation: `src/lib/ui/TransactionListRow.svelte`
- Hardens: 096

## Related

- 076, 077, 096
