# Spec 167: Backup inner-section gap

- **ID:** 167
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Backup Export and Import are separated by the same gap as the card title and its content.

## Scope

### In scope

1. `settings-section-backup` `Card.Content`: `gap-4` → `gap-(--card-spacing)`.
2. Inside each inner section, keep `gap-2`. Other Settings cards unchanged.

### Out of scope

- Card component defaults
- Cloud / Currency / Idle / Privacy / Reset cards
- 166 / 168 behavior

## Domain / UI rules

- Spec 154 used `gap-4` between inner sections. This slice updates **Backup only** to `gap-(--card-spacing)` so it matches Header ↔ Content on the same card.

## Acceptance scenarios

### Scenario: Export and Import share title gap

- **Given** signed out, Backup card
- **When** Export and Import both render
- **Then** the space between Export backup and IMPORT matches the space between Backup and EXPORT (`--card-spacing`)

## Traceability

- Vitest: none
- Playwright: none (no pixel assert)
- Implementation: Backup `Card.Content` in `MorePanel.svelte`
- Docs: point 154 at 167 for Backup inner-section gap

## Related

- 154 Settings hub (uniform cards)
- 158 Settings backup
