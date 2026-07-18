# Spec 066: Recent see more → Activity

- **ID:** 066
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add an always-visible control on the Home Recent card that navigates to Activity so users can open the full ledger list from Home.

## Scope

### In scope

1. Footer control on Recent card with label **See more in Activity**
2. Always shown — empty Recent, fewer than 5 txs, or full slice
3. Activating it navigates to Activity (same as shell nav)
4. `data-testid="recent-see-more"`

### Out of scope

- Changing the Recent 5-item cap
- Passing filters/search into Activity
- Changing header Add

## Domain rules

- None

## Acceptance scenarios

### Scenario: Visible when empty

- **Given** Home with no transactions
- **When** Recent renders
- **Then** `recent-see-more` is visible with text “See more in Activity”

### Scenario: Visible with transactions

- **Given** Home with one or more transactions
- **When** Recent renders
- **Then** `recent-see-more` is visible

### Scenario: Navigates to Activity

- **Given** Home Recent
- **When** the user activates `recent-see-more`
- **Then** Activity panel is shown (e.g. `activity-panel` visible / hash activity)

## Traceability

- Vitest: none
- Playwright: `e2e/home-amounts.e2e.ts` or new `e2e/recent-see-more.e2e.ts`
- Implementation: `src/lib/ui/AppShellChrome.svelte`

## Related

- Spec 013 (Recent card)
- Specs 067–069 (Activity list pack)
