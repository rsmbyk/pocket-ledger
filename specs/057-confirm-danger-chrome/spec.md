# Spec 057: ConfirmDialog danger chrome

- **ID:** 057
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Give really destructive confirms (delete / wipe persisted data and similar irreversible actions) a distinct danger header with icon. Mild confirms (discard filter changes, discard unsaved edits) stay plain without danger chrome or destructive confirm styling.

## Scope

### In scope

1. **`destructive={true}` ConfirmDialog UI:**
   - Edge-to-edge danger header (`border-b`, `bg-destructive/5`) with **TriangleAlert** icon + title
   - Description and footer in padded body; confirm button remains `variant="destructive"`
2. **`destructive={false}`:** plain layout (current title + description + Cancel + default Confirm)
3. **Call-site audit:**
   - Keep `destructive`: delete category, delete recurring rule, delete goal, import backup, void transaction, disable lock, reset local data (if ConfirmDialog)
   - Drop `destructive`: discard filter changes, discard unsaved tx edits
4. Stable hook e.g. `data-testid="confirm-dialog-danger-header"` when danger chrome is shown

### Out of scope

- Custom icons per action
- Changing confirm copy
- Category in-use warn dialog chrome (056 — non-destructive / no danger header)
- Spec 055 z-index (orthogonal)

## Domain rules

- None (presentation + prop usage)

## Acceptance scenarios

### Scenario: Delete category shows danger chrome

- **Given** an unused category delete confirm is open
- **When** the dialog renders
- **Then** a danger header with alert icon is visible (`confirm-dialog-danger-header`)
- **And** the confirm action uses destructive styling

### Scenario: Discard filters stays plain

- **Given** the user has dirty Activity filter draft and the discard confirm opens
- **When** the dialog renders
- **Then** there is no danger header
- **And** the confirm action is not destructive-styled

### Scenario: Discard unsaved tx stays plain

- **Given** unsaved transaction edits and the discard confirm opens
- **When** the dialog renders
- **Then** there is no danger header

## Traceability

- Vitest: none
- Playwright: `e2e/categories.e2e.ts`, `e2e/activity-filters.e2e.ts` (and/or polish)
- Implementation: `src/lib/ui/ConfirmDialog.svelte`; call sites in CategoriesPanel, MorePanel, QuickAddSheet, AppShellChrome

## Related

- Spec 015 (destructive confirms)
- Spec 056 (in-use warn uses non-destructive dialog)
- Spec 041 (modal platform)
