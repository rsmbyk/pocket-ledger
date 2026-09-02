# Spec 146: Reorder Reset both kinds + Discard confirm

- **ID:** 146
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Reorder **Reset** restores factory group order for **both** Income and Expenses. **Discard** asks for confirmation when there are unsaved reorder changes.

## Scope

### In scope

1. **Reset** — factory stock then customs (`createdAt`) for **income and expense** drafts, even if only one tab is visible. Stay in reorder. Dirty until Save. Not persisted until Save.
2. **Discard** — if the session is dirty, open ConfirmDialog before exiting. Confirm restores the enter snapshot and exits (same as today’s Discard). Cancel keeps drafts and stays in reorder. If not dirty, Discard still exits with no dialog (125).
3. Confirm chrome matches other lower-severity discards: destructive button, **no** danger header (057).

### Out of scope

- Changing Save, tab-switch, Leave Categories confirm copy
- Drag behavior, search-in-reorder
- Filters Amount (145)

## Domain / UI rules

- `resetBothKindsInOrder` (or two `resetKindInOrder` calls) updates both id lists. Visible list refreshes for `selectedKind`.
- Dirty still means either kind differs from the enter snapshot.
- Reorder Discard confirm is separate from add-category “Discard unsaved changes?” (`category-discard-confirm`).
- Testids: keep `category-reorder-reset` / `category-reorder-discard`; confirm `category-reorder-discard-confirm`.

## Acceptance scenarios

### Scenario: Reset both kinds

- **Given** reorder with Expenses scrambled and Income showing
- **When** the user chooses Reset
- **Then** the income draft is factory stock then customs
- **And** switching to Expenses shows factory stock then customs
- **And** reorder mode stays on
- **And** nothing is persisted until Save

### Scenario: Dirty Discard confirms

- **Given** reorder with an unsaved move
- **When** the user chooses Discard
- **Then** a confirm asks to discard the group order
- **And** there is no danger header
- **When** they cancel
- **Then** they stay in reorder with the draft
- **When** they confirm Discard
- **Then** they are in view mode with the last saved order

### Scenario: Clean Discard still exits

- **Given** reorder with no changes
- **When** the user chooses Discard
- **Then** they exit reorder with no confirm

## Traceability

- Vitest: `apps/web/src/lib/domain/category-reorder-session.test.ts`
- Playwright: `e2e/categories.e2e.ts` — Reset while on the other tab restores the hidden kind; dirty Discard confirm; update drop-between Discard to confirm
- Implementation: `category-reorder-session.ts`, `CategoriesPanel.svelte`
- Supersedes: Spec 125 Reset “visible kind only”; Spec 125 Discard “No confirm”

## Related

- 123 Reset factory rule; 125 dual-kind session; 057 discard chrome
