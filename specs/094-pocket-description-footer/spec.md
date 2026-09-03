# Spec 094: Pocket description footer

- **ID:** 094
- **Status:** Accepted — list footer placement superseded by [149](../149-pockets-list-card-states/spec.md)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Rename Notes → **Description** in the pocket form UI. When a description is set, show it at the **bottom of the pocket card**, full width, under a horizontal divider.

## Scope

### In scope

1. Form label **Description**; testid `pocket-description-input` (update e2e)
2. Storage remains Account `notes` (no Dexie rename)
3. If `notes.trim()` non-empty: show muted text (`data-testid` pocket-description). **List placement:** spec 149 (middle column under the name). The original full-width `border-t` footer is superseded.
4. Empty → no divider / no footer
5. Main and non-Main cards

### Out of scope

- Renaming IndexedDB / domain key `notes`
- Description on Activity rows

## Acceptance scenarios

### Scenario: Footer when set

- **Given** a pocket with a non-empty description
- **When** the Pockets list renders
- **Then** the card shows the description (149: under the name in the middle column, not a full-width footer)

### Scenario: No footer when empty

- **Given** a pocket with empty description
- **When** the card renders
- **Then** there is no description footer or divider for that content

## Traceability

- Playwright: pockets e2e
- Implementation: `PocketsPanel.svelte`

## Related

- 070, 086
