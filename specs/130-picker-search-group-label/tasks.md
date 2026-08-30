# Tasks 130: CategoryPicker search matches group labels

Reuse 124 helper. Do not start until Ronald Accepts this Draft.

## Domain

- [ ] Confirm `filterCatalogGroups` covers picker buckets (existing tests: group-name shows whole group). Add a test only if a thin wrapper is introduced.

## UI

- [ ] `apps/web/src/lib/ui/CategoryPicker.svelte` — `visibleSections` filters via `filterCatalogGroups` (group name → all members); specials still `matchesSearch` on All / Admin Fee / Uncategorized
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — open add-tx or in-group picker; type a group label; all members of that group visible; a non-matching group’s chips absent
- [ ] `e2e/activity-filters.e2e.ts` — open `activity-filter-category`; same group-label behavior on the listed options
- [ ] Keep existing picker search-by-category-name tests green

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (catalog-filter tests)
- [ ] `npx playwright test e2e/categories.e2e.ts e2e/activity-filters.e2e.ts`
- [ ] Manual: type `Work` / `Food` in tx sheet and Activity filter
