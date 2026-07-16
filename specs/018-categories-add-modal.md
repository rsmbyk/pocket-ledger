# Spec 018: Categories add modal

- **ID:** 018
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Simplify adding categories: remove the top Add card and let each kind list start an add flow with kind already known.

## Scope

### In scope

- Remove the top **Add category** card (kind toggle + inline form) from Categories
- Add control on both **Expense** and **Income** list cards
- Opening Add shows a **modal dialog** with:
  - Title for that kind (e.g. “Add expense category” / “Add income category”)
  - **Name** field only
  - Save / Cancel
- Kind is fixed by which Add was clicked (no type picker in the modal)
- Existing rename/delete and uniqueness rules unchanged

### Out of scope

- Category icons / colors
- Merge categories
- Destructive confirm styling (spec 015)
- Changing delete-when-unused rules (spec 010)

## Domain rules

- Same as spec 010: trimmed non-empty name, max 40 chars, unique within kind (case-insensitive)

## Acceptance scenarios

### Scenario: No top add card

- **Given** the Categories panel
- **When** it renders
- **Then** there is no top-level “Add category” card with expense/income toggle

### Scenario: Add expense from expense card

- **Given** Categories
- **When** the user clicks Add on the Expense card, enters `Coffee`, and saves
- **Then** `Coffee` appears under expenses and is available in quick-add for expenses

### Scenario: Add income from income card

- **Given** Categories
- **When** the user clicks Add on the Income card, enters `Bonus`, and saves
- **Then** `Bonus` appears under income

### Scenario: Modal is name-only

- **Given** the add dialog is open from Expense
- **When** the user views the dialog
- **Then** there is a name field and no income/expense type control

## Traceability

- Playwright: `e2e/categories.e2e.ts`
- Implementation: `CategoriesPanel.svelte` + existing Dialog primitives
- Related: `specs/010-custom-categories.md`
