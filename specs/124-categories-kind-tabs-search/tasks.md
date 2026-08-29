# Tasks 124: Categories kind tabs, search, hover chips

TDD for helpers; Playwright for the page. Do not start until Ronald Accepts this Draft.

## Domain / shared

- [ ] `apps/web/src/lib/shared/categories-kind-session.test.ts` — default Income; round-trip expense; malformed → Income; injectable Storage
- [ ] `apps/web/src/lib/shared/categories-kind-session.ts`
- [ ] `apps/web/src/lib/domain/category-catalog-filter.test.ts` — blank query; category substring; group-name shows whole group; no matches → empty list
- [ ] `apps/web/src/lib/domain/category-catalog-filter.ts`

## UI

- [ ] `CategoriesPanel.svelte` — tabs, search, toolbar icons, per-group cards, header plus, hover/focus chip actions, no edit mode, no in-list add chip
- [ ] `AppShellChrome.svelte` — Categories stage `max-w-none` (full inset width); keep viewport clip
- [ ] Add-group dialog: kind from selected tab, drop kind `<select>`
- [ ] Reorder lists only the selected kind
- [ ] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files

## Playwright

- [ ] `e2e/categories.e2e.ts` — rewrite 123 list scenarios for tabs (Income default; switch to Expenses for Groceries / Food & drink / hide / Warung); search; header `category-add-in-group`; no `category-edit-mode`; hover/focus hide; custom edit; reorder expense-only
- [ ] `e2e/nav.ts` — `ensureCategory` / `openAddCategory` use Expenses tab + header plus
- [ ] `e2e/desktop-layout.e2e.ts` — drop two-kind-column assertion; keep/adjust viewport-tall; assert stage wider than Home
- [ ] Other e2e that click `category-edit-mode` or `category-add-in-group` in a list (`e2e/reset.e2e.ts`, `e2e/pockets.e2e.ts`, `e2e/create-form-drafts.e2e.ts`, `e2e/transfer-admin-fee.e2e.ts` as needed)

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run`
- [ ] `npx playwright test e2e/categories.e2e.ts e2e/desktop-layout.e2e.ts`
- [ ] Manual: desktop + phone — tabs, search, hover actions, inner scroll
