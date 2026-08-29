# Tasks 123: Default catalog, groups, chip Categories page

TDD: red → green on the paths below. Do not start until Ronald Accepts the Draft.

## Domain

- [ ] Catalog table + uniqueness of slugs/names: `apps/web/src/lib/domain/default-category-catalog.test.ts`
- [ ] Group name normalize / unique-in-kind; factory order; reset built-in vs user groups: `apps/web/src/lib/domain/category-groups.test.ts`
- [ ] Category A–Z in group; migrate match vs Catch-all: same file or `apps/web/src/lib/domain/categories.test.ts`

## Application

- [ ] Empty seed inserts groups + catalog: `apps/web/src/lib/application/categories.test.ts`
- [ ] Non-empty migrate (Coffee → Catch-all `tag`; Groceries → Food & drink): same
- [ ] `createCategory` requires `groupId`; icon `tag` for user add: same
- [ ] `createCategoryGroup` appends last in kind: same
- [ ] `reorderCategoryGroups` + reset-to-factory: same
- [ ] Backup / restore `categoryGroups`, `groupId`, `icon`: `apps/web/src/lib/application/backup.test.ts`
- [ ] Month summary order = group order then A–Z: `apps/web/src/lib/domain/month-summary.test.ts`

## UI

- [ ] Chip grid, add chip, add group, Income-first: `apps/web/src/lib/ui/CategoriesPanel.svelte`
- [ ] Reorder mode + Save / Discard / Reset + dirty leave: same
- [ ] CategoryPicker / charts show icon and group-then-A–Z order

## Playwright

- [ ] Rewrite `e2e/categories.e2e.ts` for seed, chips, add, group add, reorder save/discard/reset, dirty leave
- [ ] Adjust helpers in `e2e/nav.ts` (`ensureCategory`, `selectTxCategory`) for chips / grouped picker
- [ ] Smoke Activity filter / month chart if order assertions break

## Docs

- [ ] `docs/PRODUCT.md` categories row
- [ ] `docs/DATA_MODEL.md` `categoryGroups` + category `groupId` / `icon`
- [ ] `specs/README.md` index 123 Accepted when it lands
