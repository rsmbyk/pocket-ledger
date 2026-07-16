# Spec 022: Categories icon-only row actions

- **ID:** 022
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Tighten Categories rows: replace labeled Rename / Delete with icon-only controls. Rename becomes an accept/save control, enabled only when the draft name differs from the saved name.

## Scope

### In scope

- Per-row actions in Categories only (not the card Add button, not the add dialog)
- **Save name:** Check icon, icon-only button, outline variant; `aria-label` like “Save name for {name}”; `data-testid="category-save-name"`
- **Delete:** Trash icon, icon-only, destructive variant; `aria-label` like “Delete {name}”; existing confirm (015) unchanged
- Save disabled when trimmed draft equals saved name, when trimmed draft is empty, or while busy

### Out of scope

- Changing add / rename / delete domain rules (010)
- Icon buttons elsewhere

## Domain rules

- None (presentation + client-side dirty check only)

## Acceptance scenarios

### Scenario: Save disabled when unchanged

- **Given** a category named `Food` with an unmodified draft
- **When** the row is shown
- **Then** the save-name control is disabled

### Scenario: Save enabled after edit

- **Given** the user changes the draft to `Coffee`
- **When** the draft differs from the saved name
- **Then** save-name is enabled; activating it renames the category

### Scenario: Delete still confirms

- **Given** an unused category
- **When** the user activates Delete
- **Then** a confirm runs before delete (015)

## Traceability

- Vitest: n/a
- Playwright: `e2e/categories.e2e.ts`
- Implementation: `src/lib/ui/CategoriesPanel.svelte`
- Depends on: 010, 015, 018, 021
