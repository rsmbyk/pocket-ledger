# Tasks 147: Categories reorder whole-row drag

Accepted.

## UI

- [x] `CategoriesPanel.svelte` — reorder `li` is the svelte-dnd-action drag source (remove handle-only `dragHandle` / zone `handle`); grip icon stays as visual affordance; keep 127 gap and 125 session
- [x] Income and Expenses share that list (one markup path)
- [x] Keep `ul` / `li` listitem semantics; do not break svelte-dnd-action keyboard
- [x] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [x] `e2e/categories.e2e.ts` — Income reorder: pointer-down on **Business & creating** label (not the grip), drop above Work; assert order + dirty Save
- [x] Keep 127 Expenses grip between-drop (Food & drink between Home and Utilities) green
- [x] Keep ≥ 8px gap assertion

## Verify

- [x] `npm run check`
- [x] `npx playwright test e2e/categories.e2e.ts`
- [ ] Manual: drag from label, padding, and grip on both kind tabs; neighbors still split (127)

## Docs

- [x] Index `specs/README.md` (status → Accepted in the same PR as the code)
