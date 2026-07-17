# Spec 053: Void outline + danger fill

- **ID:** 053
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Keep Void as an outlined danger control, and give it a **persistent** soft destructive background (not hover-only) so it reads clearly at rest.

## Scope

### In scope

1. Transaction sheet Void button: outline + destructive text/border + resting `bg-destructive/10` (hover may darken)

### Out of scope

- Void confirm dialog styling (057)
- Categories delete button
- Void domain behavior (014)

## Domain rules

- None

## Acceptance scenarios

### Scenario: Void resting danger fill

- **Given** an editable (non-voided) transaction sheet
- **When** Void is shown
- **Then** it uses outline + destructive border/text
- **And** it has a soft destructive background at rest (not only on hover)

## Traceability

- Vitest: none
- Playwright: `e2e/tx-sheet-polish.e2e.ts`
- Implementation: `src/lib/ui/QuickAddSheet.svelte`

## Related

- Spec 047 (Void outline + header placement)
- Spec 050 (Categories delete outline language)
