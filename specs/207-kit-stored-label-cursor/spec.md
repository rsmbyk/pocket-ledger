# Spec 207: Hex kit stored label cursor matches the checkbox

- **ID:** 207
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the hex kit screen, hovering the stored-kit sentence uses the same cursor as hovering the checkbox: pointer when enabled, not-allowed while gated (before Copy or Download).

## Scope

CSS classes on the existing wrapping `<label>` / checkbox in `HexKitScreen.svelte`. Click-to-toggle via the label stays. Copy unchanged. No Playwright cursor asserts.

## Acceptance scenarios

### Scenario: Enabled pointer

- **Given** Copy or Download has been clicked
- **When** the pointer hovers the stored-kit text
- **Then** the cursor is pointer, same as the checkbox

### Scenario: Disabled not-allowed

- **Given** neither Copy nor Download has been clicked
- **When** the pointer hovers the stored-kit text
- **Then** the cursor is not-allowed, same as the disabled checkbox

## Traceability

- Vitest: none (CSS)
- Playwright: none (cursor leftover)
- Implementation: `apps/web/src/lib/ui/HexKitScreen.svelte`
