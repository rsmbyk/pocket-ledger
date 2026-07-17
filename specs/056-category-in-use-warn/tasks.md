# Tasks 056: Category in-use warn dialog

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/051-057-ui-polish` (shared pack)
- [ ] Red Vitest: `src/lib/application/categories.test.ts` — `isCategoryInUse` true for tx and for recurring rule; false when unused
- [ ] Green app: extract helper; keep `removeCategory` guard
- [ ] Red Playwright: `e2e/categories.e2e.ts`
  - [ ] Create category + tx → Delete → warn dialog (`data-testid` e.g. `category-in-use-dialog`) → category remains
  - [ ] Unused category → delete confirm → confirm → gone
  - [ ] No Categories `role="alert"` banner for in-use path
- [ ] Green UI: `CategoriesPanel.svelte` pre-check + warn dialog; remove error banner
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
