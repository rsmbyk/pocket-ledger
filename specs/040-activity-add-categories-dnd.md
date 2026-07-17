# Spec 040: Activity Add + Categories interaction polish

- **ID:** 040
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Add a first-class Add entry on Activity, and polish Categories: full-bleed kind headers, drag-and-drop reorder with scroll-friendly dragging, denser create modal, single close path, and irreversible delete via custom confirm.

## Scope

### In scope

1. **Activity Add** — header control to open add transaction (`data-testid="activity-add"`), same action as Recent Add / command palette
2. **Categories header tint** — kind accent background fills the **entire** card header (edge to edge)
3. **Reorder via drag-and-drop** — within Income and within Expense only; replace up/down buttons; persist `sortOrder`
4. **Long-list drag** — dragging near list edges auto-scrolls so reordering remains usable when the list is long
5. **Create modal header density** — reduce wasted vertical space between header lines / padding
6. **One close path** — remove default dialog X; Cancel + Add (footer) only; keep `data-testid="category-add"`
7. **Delete irreversible warn** — custom ConfirmDialog (041); not `window.confirm`

### Schema / application

- Keep `sortOrder` from Spec 038
- Prefer `reorderCategories(kind, orderedIds)` (or equivalent) so a DnD drop can persist the full sibling order in one write
- New categories still get `max(kind) + 1`

### Out of scope

- Cross-kind drag
- Spec 039 tx sheet chrome
- Spec 041 modal open-binding / outside-click flicker (create dialog still uses stay-open + emphasize once 041 lands)
- Spec 042 toasts (success feedback may still be interim until 042)

## Domain rules

- Name uniqueness within kind unchanged
- Delete-when-unused unchanged
- Picker order follows Categories menu order (038)

## Acceptance scenarios

### Scenario: Activity Add

- **Given** Activity panel
- **When** the user activates Add
- **Then** the transaction sheet opens for create

### Scenario: Header tint full bleed

- **Given** Categories Income or Expense card
- **When** the header renders
- **Then** the kind accent background covers the full header width (no inset unpainted strip)

### Scenario: Drag reorder persists

- **Given** two expense categories A above B
- **When** the user drags B above A and releases
- **Then** B appears above A and order persists after reload

### Scenario: Create modal closes only via footer

- **Given** the create-category dialog
- **When** it is open
- **Then** there is no header X close; Cancel / Add remain in the footer

### Scenario: Delete warn irreversible

- **Given** an unused category
- **When** the user activates delete
- **Then** a custom confirm states the action cannot be undone; declining leaves the category

## Traceability

- Vitest: reorder-by-ordered-ids (or DnD persistence helper)
- Playwright: `e2e/categories.e2e.ts`, activity add
- Implementation: `AppShellChrome.svelte`; `CategoriesPanel.svelte`; `categories.ts`; `svelte-dnd-action`
- Depends on: 038; pairs with 041 (ConfirmDialog), 042 (toast)
- Supersedes: 038 up/down reorder controls
