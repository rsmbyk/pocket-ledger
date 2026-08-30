# Tasks 123: Overlay catalog, Categories list, searchable form picker

TDD: red → green on the paths below.

## Domain

- [x] Catalog table + stable ids + unique slugs/names (except locked duplicate **Other**): `apps/web/src/lib/domain/default-category-catalog.test.ts`
- [x] Overlay merge, hide, factory vs user group order, migrate match vs Catch-all, uniqueness vs stock: `apps/web/src/lib/domain/category-overlay.test.ts`

## Application

- [x] Virgin resolve inserts no Dexie stock rows: `apps/web/src/lib/application/categories.test.ts`
- [x] Non-empty migrate (Coffee → custom Catch-all `tag`; Groceries UUID → stock id): same
- [x] `createCategory` in a group; icon `tag`; uniqueness vs stock names: same
- [x] Hide/show stock (prefs) and custom (`hidden`); never hard-delete: same
- [x] `createCategoryGroup` appends last in kind: same
- [x] Group-order prefs + reset-to-factory: same
- [x] Backup / restore overlay only (custom groups, custom cats, prefs): `apps/web/src/lib/application/backup.test.ts`
- [x] Month summary order = group order then stock-then-custom: `apps/web/src/lib/domain/month-summary.test.ts`

## UI

- [x] List per group, add chip, add group, Income-first, edit/hide: `apps/web/src/lib/ui/CategoriesPanel.svelte`
- [x] Reorder mode + Save / Discard / Reset + dirty leave: same
- [x] CategoryPicker Command search, group headings, icons, type coupling: `apps/web/src/lib/ui/CategoryPicker.svelte`

## Playwright

- [x] Rewrite `e2e/categories.e2e.ts` for catalog list, add, hide, group add, reorder, picker search
- [x] Adjust helpers in `e2e/nav.ts` (`ensureCategory`, `selectTxCategory`, `selectActivityFilterCategory`) for add-chip / Command options
- [x] Activity filter grouping (`e2e/activity-filters.e2e.ts`) and other e2e that assumed a flat menu

## Docs

- [x] `docs/PRODUCT.md` categories row
- [x] `docs/DATA_MODEL.md` overlay + `categoryGroups` + prefs
- [x] `specs/README.md` index 123 Accepted
