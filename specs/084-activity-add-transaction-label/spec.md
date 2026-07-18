# Spec 084: Activity Add Transaction label

- **ID:** 084
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Activity toolbar primary button reads **Add Transaction**.

## Scope

### In scope

1. `data-testid="activity-add"` visible text **Add Transaction**
2. Keep icon + testid; update e2e if they match exact “Add”

### Out of scope

- Home Recent Add label (unless identical control — only change Activity `activity-add`)

## Acceptance scenarios

### Scenario: Label

- **Given** Activity route
- **When** the primary add control renders
- **Then** it shows “Add Transaction”

## Traceability

- Implementation: `AppShellChrome.svelte`
- Playwright: getByTestId('activity-add') has text Add Transaction

## Related

- 049
