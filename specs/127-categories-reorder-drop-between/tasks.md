# Tasks 127: Categories reorder drop-between

Playwright-first; no new domain helper unless a drop-index function is extracted. Do not start until Ronald Accepts this Draft.

## UI

- [x] `CategoriesPanel.svelte` — gap (≥ 8px) between reorder rows; drop-between works; keep grip handle; keep 125 session (dual draft, Save / Discard / Reset)
- [x] Drop extra `animate:flip` or tweak zone options only if gap is not enough
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [x] `e2e/categories.e2e.ts` — Expenses reorder: drag Food & drink between Home and Utilities; assert order + dirty Save; Discard then Reorder shows Home, Utilities, Food & drink; measure ≥ 8px gap between two rows
- [ ] Keep existing 125 reorder tests green

## Verify

- [ ] `npm run check`
- [ ] `npx playwright test e2e/categories.e2e.ts`
- [ ] Manual: drag a middle group between two others on both kind tabs; neighbors must split
