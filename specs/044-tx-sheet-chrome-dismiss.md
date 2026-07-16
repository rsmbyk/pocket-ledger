# Spec 044: Transaction sheet chrome and outside dismiss

- **ID:** 044
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Make amount/date/type/void chrome clearer, and restore outside-click as a normal close (same as Close), including unsaved discard confirm when dirty.

## Scope

### In scope

1. **Currency prefix** — InputGroup prefix has a distinct muted/background so it does not look like placeholder text
2. **DateField** — looks like an input field; includes a calendar (or similar) icon
3. **Edit type chrome** — income/expense on edit/voided must not look like a pressable button (plain badge/readout)
4. **Voided amount** — disabled amount field is flat (no lifted shadow / elevated look)
5. **Void control** — looks like a clear destructive **button** (not a ghost icon-only that reads as chrome chrome)
6. **Outside click** — pressing outside the tx dialog/sheet **closes** it (same path as Close / Escape): if dirty → discard ConfirmDialog; if clean → close. Remove stay-open emphasize for outside press
7. **Category create dialog** — same outside-click = close behavior (no emphasize-only)

### Out of scope

- Spec 043 date string format / Uncategorized icon (may land together)
- Spec 045 Activity filters
- Changing void ledger rules

## Domain rules

- None new. Dirty / discard rules from 037/041 remain; only dismiss path changes for outside click.

## Acceptance scenarios

### Scenario: Prefix distinct from hint

- **Given** the amount field
- **When** it renders
- **Then** the currency prefix has a visible background/contrast distinct from empty-input placeholder styling

### Scenario: DateField looks like an input

- **Given** the transaction date control
- **When** it renders
- **Then** it reads as a text field with a leading or trailing calendar icon

### Scenario: Edit type not clickable-looking

- **Given** an expense being edited
- **When** the type chrome shows
- **Then** it does not use button chrome (no hover press affordance)

### Scenario: Outside click closes

- **Given** an open add/edit sheet with no unsaved changes
- **When** the user presses outside the panel
- **Then** the sheet closes (same as Close)

### Scenario: Outside click with dirty warns

- **Given** a dirty sheet
- **When** the user presses outside
- **Then** the discard confirm appears; declining keeps the sheet open

## Traceability

- Vitest: n/a
- Playwright: outside click closes; dirty outside opens confirm; void button role
- Implementation: `QuickAddSheet.svelte`; `DateField.svelte`; `CategoriesPanel.svelte` create dialog; bits-ui interact-outside
- Depends on: 037, 039, 041 (partially supersedes 041 outside-click emphasize)
- Supersedes in part: Spec 041 outside-click stay-open + emphasize
