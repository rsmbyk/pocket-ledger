# Tasks 234: Xl list + filter card columns

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/234-xl-filter-card-column`
- [x] Red Playwright: `e2e/activity-filters.e2e.ts` — xl: drawer is a card; chrome top aligns with drawer; card shorter than left column; chrome stays on list scroll
- [x] Red Playwright: `e2e/plans.e2e.ts` — same geometry for `plans-chrome` / `plans-filters-drawer`; open button / sheet / Close absent on xl
- [x] Green: `AppShellChrome.svelte` — xl two-column under header; chrome in left column; filter `Card.Root` hugs header/fields/footer
- [x] Index in `specs/README.md`; note in `docs/PRODUCT.md` (Plans / desktop shell)
- [x] Commit linking Spec 234
