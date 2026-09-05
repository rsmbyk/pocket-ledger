# Spec 202: Kit stored checkbox after Copy or Download

- **ID:** 202
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the hex kit screen, **I stored this kit somewhere I can find it** stays disabled until the user clicks Copy or Download. Continue still requires the checkbox.

## Scope

`HexKitScreen` checkbox enablement. Copy/download behavior and wrap upload after confirm stay 119.

## Acceptance scenarios

### Scenario: Checkbox gated

- **Given** the hex kit screen
- **When** neither Copy nor Download has been clicked
- **Then** `hex-kit-stored` is disabled
- **And** Continue is disabled
- **When** the user clicks Copy or Download
- **Then** the checkbox is enabled
- **And** it is not checked automatically
- **When** they check it
- **Then** Continue is enabled

## Traceability

- Playwright: `e2e/cloud-auth.e2e.ts`, `e2e/sync-conflict.e2e.ts`
- Implementation: `HexKitScreen.svelte`
