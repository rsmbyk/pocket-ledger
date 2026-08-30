# Tasks 126: Categories mobile chrome, tap-to-hide, long-press edit

TDD for the press-outcome helper; Playwright for chrome and gestures. Do not start until Ronald Accepts this Draft.

## Domain / shared

- [x] `apps/web/src/lib/shared/category-chip-press.test.ts` — &lt;500ms → toggle; ≥500ms custom → rename; ≥500ms stock → none; slop / leave → none; rename-open → none
- [x] `apps/web/src/lib/shared/category-chip-press.ts` — `CATEGORY_CHIP_LONG_PRESS_MS = 500`, slop 10px, `chipPressOutcome(...)`

## UI

- [x] `CategoriesPanel.svelte` — one-row header alignment; tabs inside the catalog inset; below `md` tap/long-press wiring, no visible eye/pencil, sr-only `category-edit-name`, prevent `contextmenu`; `md+` keep 124 hover buttons
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [x] `e2e/categories.e2e.ts` — header title/plus midline; tabs vs search inset at 390×844; tap Groceries hide/show at 390 (no eye); long-press Warung → rename, not hidden; long-press Groceries → still shown; 1280 hover hide + pencil still pass
- [ ] Keep `e2e/desktop-layout.e2e.ts` categories coverage green

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (web shared helper)
- [ ] `npx playwright test e2e/categories.e2e.ts e2e/desktop-layout.e2e.ts`
- [ ] Manual: phone-width tap hide, long-press custom, tab width vs cards, header plus vs title
