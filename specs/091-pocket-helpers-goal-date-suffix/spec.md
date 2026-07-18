# Spec 091: Pocket helpers + goal-date suffix

- **ID:** 091
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Polish Spec 086 pocket form: helpers under field grids; opening helper formatted; goal-date enable control is a checkbox-only inline suffix inside the date field.

## Scope

### In scope

1. Move opening helper below Opening + As of (when opening off)
2. Opening copy: `Will be set to {formatMinor(0, currencyLabel)} as of {formatOccurredOnDisplay(creationDate)} (pocket creation date).`
3. Move goal helper below Goal target + Goal date (when goal off); keep `No goal will be saved for this pocket.`
4. Extend DateField with optional trailing snippet inside field chrome (right)
5. Goal date: checkbox only in trailing (no “Has date” text); `aria-label="Has date"`; keep `pocket-goal-date-enabled`
6. Keep helper testids

### Out of scope

- Changing enable-flag save semantics
- Currency addon on opening amount fields

## Acceptance scenarios

### Scenario: Opening helper

- **Given** Add pocket with opening unchecked
- **When** the form renders
- **Then** helper is below As of, includes formatted currency + display date + `(pocket creation date)`

### Scenario: Goal date suffix

- **Given** Edit pocket with goal enabled
- **When** the goal date field renders
- **Then** the enable checkbox is inside/at the end of the date control, not beside the Goal date label text

## Traceability

- Implementation: `PocketsPanel.svelte`, `DateField.svelte`
- Hardens: 086

## Related

- 086
