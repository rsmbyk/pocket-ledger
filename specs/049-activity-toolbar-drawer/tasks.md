# Tasks 049: Activity toolbar, drawer, sort icons, Clear

- **Status:** Accepted (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/049-activity-toolbar-drawer`
- [ ] Red Vitest: N/A (or extract icon helper + red/green if cleaner)
- [ ] Red Playwright: extend `e2e/activity-filters.e2e.ts`
  - [ ] Desktop default: Filters beside search; Add below right-aligned (bounding boxes / DOM order)
  - [ ] `test.use` viewport ≥1280: open Filters → `activity-filters-drawer` visible; sheet overlay not blocking (or absent)
  - [ ] Date header cycle: default vs occurred-desc icon/testid differs; asc distinct
  - [ ] Clear uses outline (class / computed border)
  - [ ] Existing Apply / Clear / dirty-warn scenarios still pass
- [ ] Green UI: `AppShellChrome.svelte`, `ActivityTable.svelte`
- [ ] Note on `specs/045-home-activity-filters.md` that drawer/toolbar delivery is completed by 049
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking `./spec.md`
