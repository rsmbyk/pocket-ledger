# Plan 050: Categories header density + delete outline

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Corrects Spec 046 padding target (header only, not whole card)

## Why

046 tightened Categories “card padding,” but the intent was denser **headers**. Card body should match the prior feel; delete should read as outlined danger like Void.

## Scope / edges

**In:** restore card body padding/spacing to pre-046 body feel; tighter header only (even top/bottom); delete outlined danger.

**Out:** DnD behavior; Add modal; toast system (already removed).

## Approach

- CategoriesPanel: restore Content/row spacing if over-tightened; header `py-2` (or similar) and neutralize Card `[.border-b]:pb-(--card-spacing)`.
- Delete: `variant="outline"` + `border-destructive/40 text-destructive hover:bg-destructive/10`.

## TDD

- Vitest: none
- Playwright: extend `e2e/categories.e2e.ts`

## Out of scope

Reorder/DnD changes; save button redesign beyond keeping outline.
