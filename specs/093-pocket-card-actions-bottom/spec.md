# Spec 093: Pocket card actions bottom

- **ID:** 093
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Pocket card action buttons (clear goal / edit / delete) sit on the **bottom** of the end column, aligned with the last content row when the goal block makes the card tall.

## Scope

### In scope

1. Outer pocket row: `items-stretch`
2. Right column: amount top, button group bottom (`justify-between` / `mt-auto`)
3. Keep button order and testids

### Out of scope

- Redesigning goal progress
- Moving buttons into the left column

## Acceptance scenarios

### Scenario: Tall goal card

- **Given** a pocket with a goal progress block
- **When** the card renders
- **Then** edit/clear controls are near the bottom of the card end column, not mid-card under the balance alone

## Traceability

- Implementation: `PocketsPanel.svelte` `pocketRow`

## Related

- 072, 086
