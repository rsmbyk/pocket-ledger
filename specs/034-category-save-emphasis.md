# Spec 034: Emphasize active category save

- **ID:** 034
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Make the Categories save (check) control obvious when it can be activated.

## Scope

### In scope

- Save button (`data-testid="category-save-name"`): **enabled** → `variant="default"` (primary); **disabled** → quiet outline/ghost + disabled opacity
- Disable rules unchanged (022): unchanged name, empty trim, or busy

### Out of scope

- Delete button styling
- Spec 038 broader Categories redesign

## Domain rules

- None

## Acceptance scenarios

### Scenario: Enabled save is primary

- **Given** the user changes a category name draft
- **When** save becomes enabled
- **Then** the control uses the default/primary button variant

### Scenario: Unchanged stays quiet

- **Given** an unmodified draft
- **When** the row renders
- **Then** save is disabled and not primary-filled

## Traceability

- Vitest: n/a
- Playwright: optional class assert in `e2e/categories.e2e.ts`
- Implementation: `src/lib/ui/CategoriesPanel.svelte`
- Depends on: 022
