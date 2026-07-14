# Spec 010: Custom category management

- **ID:** 010
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Let the user add, rename, and remove categories beyond the seed set, so expenses and income can use personal labels.

## Scope

### In scope

- Hash route `#/categories` and a Categories shell tab
- Add category (name + income/expense kind)
- Rename category
- Delete category when unused
- New categories appear in quick-add and recurring pickers
- Seed categories remain editable like custom ones (rename/delete with same rules)

### Out of scope

- Category icons / colors
- Merge categories
- Soft-archive / hide without delete
- Per-account category sets

## Domain rules

- Name: trimmed, non-empty, max 40 chars
- Names unique within the same kind (case-insensitive)
- Delete blocked if any transaction or recurring rule references the category

## Acceptance scenarios

### Scenario: Add a custom expense category

- **Given** the Categories panel
- **When** the user adds expense category `Coffee`
- **Then** `Coffee` appears in the expense list and in the quick-add expense picker

### Scenario: Rename updates labels

- **Given** a category named `Coffee`
- **When** the user renames it to `Cafe`
- **Then** lists and pickers show `Cafe`

### Scenario: Delete blocked when in use

- **Given** a transaction tagged with category `Coffee`
- **When** the user tries to delete `Coffee`
- **Then** deletion fails with a clear error and the category remains

## Traceability

- Vitest: `src/lib/domain/categories.test.ts`, `src/lib/application/categories.test.ts`
- Playwright: `e2e/categories.e2e.ts`
- Implementation: `src/lib/application/categories.ts`, `CategoriesPanel.svelte`, router + AppShell
