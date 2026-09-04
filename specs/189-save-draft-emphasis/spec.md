# Spec 189: Save draft emphasis

- **ID:** 189
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Add-transaction discard confirm, **Save draft** is the filled primary button. Cancel stays outline. Discard stays destructive.

## Scope

`ConfirmDialog` secondary action only. No copy or draft behavior change.

## Acceptance scenarios

### Scenario: Save draft is primary

- **Given** Add transaction is dirty and discard is open
- **When** the confirm is shown
- **Then** Save draft uses the default/filled button; Cancel is outline; Discard is destructive

## Traceability

- Implementation: `ConfirmDialog.svelte`
- Playwright: existing `e2e/create-form-drafts.e2e.ts` still clicks Save draft
