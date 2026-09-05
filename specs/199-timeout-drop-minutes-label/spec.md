# Spec 199: Drop Minutes label under Timeout

- **ID:** 199
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Timeout in Settings has no Minutes label. The Timeout heading and `N minutes` on the control are enough. The trigger is named Timeout for assistive tech.

## Acceptance scenarios

### Scenario: Minutes label gone

- **Given** Settings Timeout
- **When** the section is shown
- **Then** there is no Minutes label
- **And** `idle-minutes` is still usable

## Traceability

- Playwright: `e2e/settings.e2e.ts`
- Implementation: `MorePanel.svelte`
