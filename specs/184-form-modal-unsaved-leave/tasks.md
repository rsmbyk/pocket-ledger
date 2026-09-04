# Tasks 184: Form modal unsaved-leave

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted (execute the attached plan)
- [x] Branch `feat/184-form-modal-unsaved-leave`
- [x] TDD: `apps/web/src/lib/application/goal-form-dirty.test.ts` — create empty not dirty; description-only dirty; edit vs baseline
- [x] Remove pocket/category draft APIs; keep tx in `create-form-drafts.ts` + unit tests
- [x] `PocketGoalFormDialog.svelte` prevent-then-warn + two-button confirm
- [x] `PocketsPanel.svelte` two-button for create+edit; no draft restore
- [x] `CategoriesPanel.svelte` two-button for add/group/rename; no draft restore
- [x] Playwright: `e2e/create-form-drafts.e2e.ts`; `e2e/goals.e2e.ts`
- [x] `npm run check` + `npm run test:unit:run` + targeted e2e
- [x] Commit linking Spec 184
