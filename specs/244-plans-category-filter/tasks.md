# Tasks 244: Plans category filter

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Domain

- [x] Red Vitest `apps/web/src/lib/domain/plan-filters.test.ts` — `categoryIds` match (user, Uncategorized, Admin Fee fee + sentinel, empty=All, AND with type); used-only / shouldShow / uncategorized-only hides
- [x] Green helpers in `apps/web/src/lib/domain/plan-filters.ts`
- [x] Red/green `apps/web/src/lib/shared/plans-list-session.test.ts` — parse/write `categoryIds`

## UI

- [x] `AppShellChrome.svelte` — Category between Type and Pocket; type-change sync; hide + snap to All; badge
- [x] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright / docs

- [x] `e2e/plans.e2e.ts` — replace type-and-pocket-only; hide when empty; used Food not Groceries; Transfer disables; Apply filters list
- [x] `docs/PRODUCT.md` Plans filters: type, category, pocket
- [x] Spec 223 scenario note superseded
- [x] `npm run check`
- [x] `npm run test:unit:run`
- [x] `npx playwright test e2e/plans.e2e.ts`
