# Tasks 101: Activity date sort secondary by createdAt

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — same-day `createdAt` secondary for `occurredOn-desc` / `occurredOn-asc`; different-day primary still wins; Default unchanged
- [ ] **Green** `src/lib/domain/activity-filters.ts` `sortTransactions`
- [ ] Optional Playwright smoke in `e2e/activity-filters.e2e.ts` if useful
- [ ] `npm run check` + unit tests
- [ ] Traceability in `./spec.md`
- [ ] Note on Spec 064: date-mode tie-break superseded by 101
- [ ] Commit with pack
