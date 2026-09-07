# Tasks 223: Plans (one-shot)

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted
- [ ] Branch: `feat/223-plans`
- [ ] Red Vitest: `apps/web/src/lib/domain/plan.test.ts` — home window; Once complete/skip gravestone; pocket-delete block; category-in-use
- [ ] Red Vitest: `apps/web/src/lib/domain/plan-filters.test.ts` — search description/note/amount; type + pocket filters; group nearest-first; pocket order then `createdAt` desc
- [ ] Red Vitest: `apps/web/src/lib/application/plans.test.ts` — CRUD, accept Save posts tx, Drop gravestone
- [ ] Red Vitest: `apps/web/src/lib/application/backup.test.ts` — export includes plans; import missing key ok
- [ ] Red Vitest: `apps/web/src/lib/shared/router.test.ts` — `/plans`, nav order, nearest parent
- [ ] Green: Dexie + domain + application + sync `plan` + crypto + backup/reset
- [ ] Red Playwright: `e2e/plans.e2e.ts` — Home card window; pocket details list; `/plans` search/filters/Add; accept vs edit; Drop; Skip
- [ ] Green UI: lists, Plan modal, `/plans` chrome, nav + command palette
- [ ] `docs/DATA_MODEL.md` + `docs/PRODUCT.md`; index in `specs/README.md`
- [ ] Commit linking Spec 223
