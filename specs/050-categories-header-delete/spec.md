# Spec 050: Categories header density + delete outline

- **ID:** 050
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Apply Spec 046 density to the **card header** only, restore the card body to its prior padding feel, and make category Delete an outlined danger control consistent with Void.

## Scope

### In scope

1. **Card body** — restore Categories card body / row padding to the pre-046 denser-pass body feel (undo unintended whole-card squeeze)
2. **Header density** — reduce **header** vertical padding only; top and bottom of the header match (no Card `border-b` spacing quirk)
3. **Delete** — outlined danger button (outline + destructive border/text), same language as transaction Void

### Out of scope

- Drag-and-drop (040)
- Add category modal
- Re-introducing toasts

## Domain rules

- None

## Acceptance scenarios

### Scenario: Header tighter than body intent

- **Given** Categories Income or Expense card
- **When** it renders
- **Then** the header is denser than before 050’s correction target, while row/body spacing matches the restored body feel (not the over-tightened whole-card look)

### Scenario: Delete outlined danger

- **Given** a category row
- **When** Delete is shown
- **Then** it uses outline + destructive styling (not filled-only soft destructive without outline)

## Traceability

- Vitest: none
- Playwright: `e2e/categories.e2e.ts`
- Implementation: `src/lib/ui/CategoriesPanel.svelte`

## Related

- Corrects Spec 046 item 1 (card padding → header padding)
- Aligns delete with 046 item 3 using stronger outlined-danger chrome
