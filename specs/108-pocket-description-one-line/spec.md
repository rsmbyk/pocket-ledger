# Spec 108: Pocket description one-line

- **ID:** 108
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Add/Edit pocket dialog, **Description** is a single-line text field (not a multiline textarea).

## Scope

### In scope

1. Pocket form Description uses a one-line text input
2. Keep label `Description`, placeholder `Optional`, and `data-testid="pocket-description-input"`
3. Continue binding to `formNotes` / persisted `notes`

### Out of scope

- Pocket card footer display of notes (Spec 094)
- Renaming domain `notes` to `description`
- Maxlength or other validation
- Textareas on other dialogs

## Domain rules

None (presentation). Existing trim on create/update stays as-is.

## Acceptance scenarios

### Scenario: Description is one line

- **Given** the Add or Edit pocket dialog is open
- **When** the Description field renders
- **Then** the control is a single-line `<input>` (not a `<textarea>`)
- **And** Enter does not insert a newline in the field
- **And** the value still saves to `notes`

## Traceability

- Playwright: `e2e/pockets.e2e.ts` — description control is `input`
- Implementation: `src/lib/ui/PocketsPanel.svelte`

## Related

- Spec 070 (pocket CRUD)
- Spec 094 (pocket description footer)
