# Spec 081: Tx mode tabs default chrome

- **ID:** 081
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Normal | Transfer must read as a **tab list** with a clear active segment — not flat underline-only labels.

## Scope

### In scope

1. `tx-mode-tabs` uses Tabs List **`variant="default"`** (not `line`)
2. Active tab visually distinct (background / track); inactive muted
3. Keep `data-testid`s and behavior (Normal / Transfer switching)

### Out of scope

- Income / Expense chrome
- Transfer domain rules

## Acceptance scenarios

### Scenario: Looks like tabs

- **Given** Add transaction with ≥2 pockets
- **When** Normal | Transfer renders
- **Then** the control uses default tab-list chrome (muted track + raised active)
- **And** selecting Transfer still shows transfer fields

## Traceability

- Playwright: pockets e2e transfer tab still works
- Implementation: `QuickAddSheet.svelte`
- Supersedes 073 visual choice of line tabs for `tx-mode-tabs` only

## Related

- 073
