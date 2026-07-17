# Tasks 048: Home amount hide + by-category icons

- **Status:** Accepted (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/048-home-amount-hide-icons`
- [ ] Red Vitest: `src/lib/shared/hide-amounts.test.ts`
  - [ ] default false
  - [ ] round-trip true/false
  - [ ] garbage → false
- [ ] Green: `src/lib/shared/hide-amounts.ts`
- [ ] Red Playwright: `e2e/home-amounts.e2e.ts`
  - [ ] icons on by-category titles; absent on sum tiles
  - [ ] hide → masked, no `+`/`−`, no sign colors on amounts
  - [ ] reload keeps hidden
- [ ] Green UI: AppShellChrome, MonthSummary, CategoryBreakdownChart
- [ ] Cross-link note on `specs/045-home-activity-filters.md` → superseded by 048 for those bullets
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking `./spec.md`
