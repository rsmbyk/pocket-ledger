# Spec 099: Tight amount+pocket stack, vertically centered

- **ID:** 099
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Supersedes **098**. When `showPocket` is on, the amount and pocket label(s) form a **tight** right-column stack (no gap between them) that is **vertically centered** against the left column (title → optional note → date).

Target:

```
[Title / Transfer     ]
[note if any          ]  [amount ]
[date                 ]  [pocket ]
```

## Scope

### In scope

1. Remove 098 bottom-align stretch / `mt-auto` behavior
2. Amount column: no gap between amount and pocket
3. When the row has a secondary line: outer row `items-center` so the amount+pocket block centers against the left stack
4. Keep testids; transfer chrome; left order title → note → date (096)

### Out of scope

- Amount colors / when `showPocket` is passed
- Changing left-column order

## Acceptance scenarios

### Scenario: Centered tight stack with note

- **Given** a date-secondary row with a note and showPocket
- **When** it renders
- **Then** amount and pocket have no vertical gap between them, and that stack is vertically centered relative to the left title/note/date block (pocket is not pinned to the date row alone)

### Scenario: Tight stack without note

- **Given** a date-secondary row with showPocket and no note
- **When** it renders
- **Then** amount and pocket remain a tight stack under/ beside the left title+date block with no gap between amount and pocket

## Traceability

- Implementation: `src/lib/ui/TransactionListRow.svelte`
- Supersedes: 098; hardens 096

## Related

- 076, 077, 096, 098
