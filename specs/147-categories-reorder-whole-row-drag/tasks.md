# Tasks 147: Categories reorder whole-row drag

Playwright-first; no new domain helper. Do not start until Ronald Accepts this Draft.

## UI

- [ ] `CategoriesPanel.svelte` — reorder `li` is the svelte-dnd-action drag source (remove handle-only `dragHandle` / zone `handle`); grip icon stays as visual affordance; keep 127 gap and 125 session
- [ ] Income and Expenses share that list (one markup path)
- [ ] Keep `ul` / `li` listitem semantics; do not break svelte-dnd-action keyboard
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — Income reorder: pointer-down on **Business & creating** label (not the grip), drop above Work; assert order + dirty Save
- [ ] Keep 127 Expenses grip between-drop (Food & drink between Home and Utilities) green
- [ ] Keep ≥ 8px gap assertion

## Verify

- [ ] `npm run check`
- [ ] `npx playwright test e2e/categories.e2e.ts`
- [ ] Manual: drag from label, padding, and grip on both kind tabs; neighbors still split (127)

## Docs

- [ ] Index `specs/README.md` (status → Accepted in the same PR as the code)
