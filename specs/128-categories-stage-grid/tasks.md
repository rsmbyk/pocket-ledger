# Tasks 128: Categories stage-width grid

Layout CSS; Playwright for columns. Do not start until Ronald Accepts this Draft.

## UI

- [ ] `apps/web/src/lib/ui/CategoriesPanel.svelte` — catalog `auto-fill` min **C2** (`22rem`); chip list 1 / 2 / 3 via card `@container` at C2 / C3; drop viewport `sm:grid-cols-2 xl:grid-cols-3` and always-on chip `grid-cols-2`
- [ ] Reorder `<ul>` stays a single column (127)
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — viewport 834×1112, open sidebar; Work: one group column, two chip columns; Commission text is not `…` truncated
- [ ] Same file or `e2e/desktop-layout.e2e.ts` — catalog wide enough for two C2 tracks and cards below C3 → ≥2 group columns and 2 chip columns; catalog wide enough for four C2 tracks → 4 group columns

## Verify

- [ ] `npm run check`
- [ ] `npx playwright test e2e/categories.e2e.ts e2e/desktop-layout.e2e.ts`
- [ ] Manual: tablet + sidebar, phone, wide desktop — chips then extra groups; 3 chips only as leftover
