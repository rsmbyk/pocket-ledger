# Spec 198: Freeze Edit pocket description

- **ID:** 198
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Edit pocket subtitle is the display name from when the dialog opened. Typing in Name does not change it. Add pocket copy is unchanged.

## Acceptance scenarios

### Scenario: Name edits do not rewrite the subtitle

- **Given** Edit pocket opened for a pocket displaying Main
- **When** the user types in Name
- **Then** the description still reads `Update details for Main.`

## Traceability

- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `PocketsPanel.svelte`
