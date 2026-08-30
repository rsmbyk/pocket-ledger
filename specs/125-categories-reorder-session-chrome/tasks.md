# Tasks 125: Categories reorder session and chrome

TDD for the dual-kind draft helper; Playwright for the page.

## Domain

- [ ] `apps/web/src/lib/domain/category-reorder-session.test.ts` — snapshot both kinds from a group list; dirty when either order differs; not dirty when equal; Reset-visible-kind helper returns factory stock then customs for one kind without touching the other
- [ ] `apps/web/src/lib/domain/category-reorder-session.ts`

## UI

- [ ] `CategoriesPanel.svelte` — dual-kind draft; tab switch with no confirm; Save both; Discard restores + exits; hide/clear search in reorder; remove Done; search/toolbar inset; shorter headers; `cursor-default` on chips; toolbar icon alignment; dark-mode tab fills
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — search hidden + cleared; no Done; Discard exits to chips; switch kind in reorder without confirm and keep expense draft; Save both kinds (reload)
- [ ] Keep `e2e/desktop-layout.e2e.ts` viewport-tall / chip-width coverage green

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (web domain tests for the helper)
- [ ] `npx playwright test e2e/categories.e2e.ts e2e/desktop-layout.e2e.ts`
- [ ] Manual: reorder both tabs, Discard, dark-mode Income/Expenses tint, search width vs cards
