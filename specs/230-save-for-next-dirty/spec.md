# Spec 230: Save for next until dirty

- **ID:** 230
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

**Save for next** is off until accept-mode tx info differs from the seeded Plan. **Save** still posts a clean occurrence.

## Scope

### In scope

1. Accept mode, stored Repeat not Once: `plan-save-for-next` disabled until `isDirty`. Revert → disabled again.
2. `plan-save` stays enabled when the form is valid, even if unchanged.
3. Cancel / Skip unchanged.

### Out of scope

- Save for next payload (224)
- Edit-mode Save / discard confirm
- Hide Save for next on Once (already 224)

## Domain / UI rules

- Dirty is the existing accept/edit snapshot vs baseline (same as discard).
- Disabled also when `saveDisabled` (empty amount, etc.).

## Acceptance scenarios

### Scenario: Clean accept

- **Given** accept mode on a Weekly or Monthly Plan with no edits
- **When** the footer renders
- **Then** Save for next is disabled
- **And** Save is enabled (if the form is valid)

### Scenario: Dirty then revert

- **Given** accept mode
- **When** the user changes amount
- **Then** Save for next is enabled
- **And** when they restore the original amount, it is disabled again

## Traceability

- Vitest: none required (UI gate on existing `isDirty`)
- Playwright: `e2e/plans.e2e.ts` — accept Weekly: Save for next disabled; fill amount → enabled
- Implementation: `PlanSheet.svelte` `disabled={saveDisabled || !isDirty}` on `plan-save-for-next`

## Related

- 224
