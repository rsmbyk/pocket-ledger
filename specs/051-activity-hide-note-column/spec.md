# Spec 051: Hide Activity Note column

- **ID:** 051
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Remove the Note column from the Activity table so the list focuses on Date, Category, and Amount. Notes remain editable on the transaction form and searchable.

## Scope

### In scope

1. Remove Activity table **Note** column (header + cell)
2. Update acceptance tests that expected note text in `activity-list`

### Out of scope

- Note field on add/edit transaction sheet
- Activity search matching notes
- Home Recent note line
- Field encryption of notes

## Domain rules

- None

## Acceptance scenarios

### Scenario: No Note column

- **Given** Activity with at least one transaction that has a note
- **When** the Activity list renders
- **Then** there is no column header named “Note”
- **And** the note text does not appear as a dedicated table cell in the row
- **And** Date, Category, and Amount columns remain

### Scenario: Note still on form

- **Given** the user opens a transaction that has a note
- **When** the transaction sheet is shown
- **Then** the Note field still shows the note

## Traceability

- Vitest: none
- Playwright: `e2e/encryption.e2e.ts`, `e2e/desktop-layout.e2e.ts` (or activity list e2e)
- Implementation: `src/lib/ui/ActivityTable.svelte`

## Related

- Spec 017 (search by note — unchanged)
- Spec 011 (encryption — assert plaintext via form/unlock path, not activity-list cell)
