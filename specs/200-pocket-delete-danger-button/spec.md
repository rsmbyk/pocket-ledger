# Spec 200: Delete pocket uses outlined danger

- **ID:** 200
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

**Delete pocket** on the edit form uses the same outlined danger Button as Void, Drop goal, and Sign out.

## Scope

`pocket-delete` trigger chrome only. Confirm, blocked popover, Main/create omit stay 153.

## Acceptance scenarios

### Scenario: Outlined danger

- **Given** Edit on a non-Main pocket
- **When** Delete pocket is shown
- **Then** it uses outlined danger (`border-destructive` and resting `bg-destructive/10`)

## Traceability

- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `PocketsPanel.svelte`
