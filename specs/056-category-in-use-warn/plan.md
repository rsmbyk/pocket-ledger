# Plan 056: Category in-use warn dialog

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Deleting a category that is still used currently fails after confirm and shows an inline red banner. Users should learn **before** a destructive confirm that delete isn’t allowed, via a clear warning dialog.

## Scope / edges

**In:** Pre-check on Delete click; in-use → warn dialog (dismiss only); unused → existing delete confirm; remove Categories inline `{#if error}` alert.

**Out:** Reassignment UX; disabling Delete; More-panel alerts; changing domain “still used” rule (txs **or** recurring rules).

## Approach

- Extract `isCategoryInUse(id)` (or equivalent) from [`removeCategory`](../../src/lib/application/categories.ts) counting logic; keep `removeCategory` throwing as defense-in-depth.
- [`CategoriesPanel.svelte`](../../src/lib/ui/CategoriesPanel.svelte): on Delete → await in-use check → warn vs delete confirm; drop error banner UI.

## TDD

- Vitest: `src/lib/application/categories.test.ts` for `isCategoryInUse`
- Playwright: `e2e/categories.e2e.ts` — in-use warn; unused delete still works

## Out of scope

Changing when a category counts as used.
