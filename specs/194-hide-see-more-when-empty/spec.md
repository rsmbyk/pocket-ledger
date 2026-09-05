# Spec 194: Hide See more when Recent is empty

- **ID:** 194
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Hide **See more in Transactions** on Home Recent and pocket-details Latest when that list has no transactions. Keep the empty-state copy and Add. Show the control when there is at least one row.

Supersedes Spec 066 “visible when empty” and Spec 148 “always visible, including empty” for this footer only.

## Scope

### In scope

- Home `recent-see-more` when `recent.length === 0`
- Pocket details `pocket-details-see-more` when `latest.length === 0`

### Out of scope

Copy, navigation, Transactions filters when the control is shown, Recent cap, header Add.

## Acceptance scenarios

### Scenario: Home empty hides See more

- **Given** Home with no transactions
- **When** Recent renders
- **Then** `recent-empty` is visible
- **And** `recent-see-more` is absent

### Scenario: Home with rows keeps See more

- **Given** Home with at least one transaction
- **When** Recent renders
- **Then** `recent-see-more` is visible
- **And** activating it opens Transactions

### Scenario: Pocket details empty hides See more

- **Given** pocket details with no latest transactions
- **When** the Latest card renders
- **Then** `pocket-details-see-more` is absent

## Traceability

- Playwright: `e2e/recent-see-more.e2e.ts`, `e2e/pocket-details.e2e.ts`
- Implementation: `AppShellChrome.svelte`, `PocketDetailsPanel.svelte`
