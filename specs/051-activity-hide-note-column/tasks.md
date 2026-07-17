# Tasks 051: Hide Activity Note column

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/051-057-ui-polish` (shared pack)
- [ ] Red Playwright:
  - [ ] `e2e/encryption.e2e.ts` — stop expecting `secret lunch` in `activity-list`; assert note via edit sheet (or equivalent)
  - [ ] Assert Activity list has no columnheader “Note”
- [ ] Green UI: `src/lib/ui/ActivityTable.svelte` remove Note column
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking this pack’s specs
