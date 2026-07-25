# Tasks 101: Activity date sort secondary by createdAt

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — same-day `createdAt` secondary for `occurredOn-desc` / `occurredOn-asc`; different-day primary still wins; Default unchanged
- [x] **Green** `src/lib/domain/activity-filters.ts` `sortTransactions`
- [x] Optional Playwright smoke in `e2e/activity-filters.e2e.ts` if useful — deferred (Vitest covers domain rule)
- [x] `npm run check` + unit tests
- [x] Traceability in `./spec.md`
- [x] Note on Spec 064: date-mode tie-break superseded by 101
- [ ] Commit with pack
