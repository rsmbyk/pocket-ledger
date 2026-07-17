# Tasks 058: Always-on Activity filters drawer

- **Status:** Draft (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/051-057-ui-polish` (or follow-up on PR #23)
- [ ] Red Playwright `e2e/activity-filters.e2e.ts` xl:
  - [ ] Drawer visible without open click
  - [ ] `activity-filters-open` count 0
  - [ ] No Close; Clear + Apply present
- [ ] Green UI: always-on drawer; hide open; persistent chrome; full-width stage; top-align fields
- [ ] Note on Spec 049 that 058 supersedes open-to-show on ≥1280
- [ ] `npm run check` + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit + update draft PR
