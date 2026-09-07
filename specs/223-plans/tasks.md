# Tasks 223: Plans (one-shot)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/223-plans`
- [x] Red Vitest: `apps/web/src/lib/domain/plan.test.ts` — home window; Once complete/skip gravestone; pocket-delete block; category-in-use
- [x] Red Vitest: `apps/web/src/lib/domain/plan-filters.test.ts` — search description/note/amount; type + pocket filters; group nearest-first; pocket order then `createdAt` desc
- [x] Red Vitest: `apps/web/src/lib/application/plans.test.ts` — CRUD, accept Save posts tx, Drop gravestone
- [x] Red Vitest: `apps/web/src/lib/application/backup.test.ts` — export includes plans; import missing key ok
- [x] Red Vitest: `apps/web/src/lib/shared/router.test.ts` — `/plans`, nav order, nearest parent
- [x] Green: Dexie + domain + application + sync `plan` + crypto + backup/reset
- [x] Red Playwright: `e2e/plans.e2e.ts` — Home card window; pocket details list; `/plans` search/filters/Add; accept vs edit; Drop; Skip
- [x] Green UI: lists, Plan modal, `/plans` chrome, nav + command palette
- [x] `docs/DATA_MODEL.md` + `docs/PRODUCT.md`; index in `specs/README.md`
- [x] Commit linking Spec 223
