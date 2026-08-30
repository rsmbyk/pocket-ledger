# Tasks 131: Categories group header actions

TDD rename use case; Playwright for chrome and gestures. Do not start until Ronald Accepts this Draft.

## Domain / application

- [ ] Red Vitest `apps/web/src/lib/application/categories.test.ts` — `renameCategoryGroup`: rename custom; unique within kind (`exceptId`); stock id throws
- [ ] Green `renameCategoryGroup` in `apps/web/src/lib/application/categories.ts` (reuse `assertUniqueGroupName` / `normalizeGroupName`)

## UI

- [ ] `CategoriesPanel.svelte` — header actions eye · edit (custom) · add; icon-only + aria-labels; separators; `md+` hover/focus-within; below `md` add only + name click/hold; all-hidden card `data-group-hidden`; Rename group dialog
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — `md+`: hover shows three (custom) / two (stock); eye hides all + muted card; rename via pencil
- [ ] Same file — 390px: no eye/edit; add visible; custom name click → dialog; hold 500ms toggles hide without dialog; stock name click no dialog

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (categories application tests)
- [ ] `npx playwright test e2e/categories.e2e.ts`
- [ ] Manual: desktop hover cluster; phone click vs hold on custom vs stock; all-hidden card
