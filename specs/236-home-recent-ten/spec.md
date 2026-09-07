# Spec 236: Home Recent shows 10

- **ID:** 236
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Home Recent shows the same **10** newest rows as pocket details Recent.

## Scope

### In scope

1. Home Recent slice length is **10** (was 5).
2. Sort, voided-hidden, and row chrome stay as they are.

### Out of scope

- Pocket details cap (already 10)
- See more copy and empty-hide (066 / 194)
- Home xl columns (238)

## Domain / UI rules

- **Supersedes 013** “newest 5 txs” and **066** “5-item cap”.
- See more still shows when the list is non-empty (194) and still goes to Transactions with no extra filter (066).

## Acceptance scenarios

### Scenario: Home Recent caps at 10

- **Given** Home with 11 active transactions
- **When** Recent renders
- **Then** `recent-list` has 10 rows
- **And** the 6th through 10th newest are visible
- **And** `recent-see-more` is visible

## Traceability

- Vitest: none required
- Playwright: `e2e/recent-see-more.e2e.ts`
- Implementation: `AppShellChrome.svelte` `transactions.slice(0, 10)`

## Related

- 013, 066, 148, 194
