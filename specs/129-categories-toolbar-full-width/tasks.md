# Tasks 129: Categories toolbar full width on small screens

CSS on the default-mode toolbar. Do not start until Ronald Accepts this Draft.

## UI

- [ ] `apps/web/src/lib/ui/CategoriesPanel.svelte` — below `md`, Add group + Reorder `grid w-full grid-cols-2` (or equivalent equal flex); `md+` keep `justify-end` hug-content; do not stretch Reset / Discard / Save
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — 390px: two buttons equal width, row matches search inset; 1024px: buttons not half catalog; reorder mode at 390px: Save not in a 2-col stretch with Add group

## Verify

- [ ] `npm run check`
- [ ] `npx playwright test e2e/categories.e2e.ts`
- [ ] Manual: phone vs desktop toolbar
