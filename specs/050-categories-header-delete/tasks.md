# Tasks 050: Categories header density + delete outline

- **Status:** Accepted (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/050-categories-header-delete`
- [ ] Red Vitest: N/A
- [ ] Red Playwright: extend `e2e/categories.e2e.ts`
  - [ ] Delete control has outline + destructive classes (regex on class attribute)
  - [ ] Existing add / deep-link / income-before-expense scenarios still pass
- [ ] Green UI: `CategoriesPanel.svelte` (+ Card header class fixes)
- [ ] Visual check: header padding even; body not squeezed vs pre-046 body
- [ ] Cross-link note on `specs/046-categories-density-no-toasts.md`
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking `./spec.md`
