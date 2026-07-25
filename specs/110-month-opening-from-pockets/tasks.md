# Tasks 110: Month opening from pocket openings

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/domain/pocket-balance.test.ts` — `balanceAtDayStart` (equal as-of; forward; reverse mid-gap expense; voided ignored)
- [ ] **Green** helper in `src/lib/domain/pocket-balance.ts`
- [ ] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — Opening = sum of day-start balances; Ending = Opening + Net; update prior-tx / fee fixtures to pass pockets
- [ ] **Green** `buildMonthSummary` takes pockets and uses inferred Opening
- [ ] **Red/Green Vitest:** `src/lib/application/month-summary.test.ts` — load passes pockets into summary
- [ ] Playwright: `e2e/month-opening-from-pockets.e2e.ts` — mid-gap expense before as-of → June Opening reflects reverse
- [ ] `npm run check` + unit (+ e2e) green
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking Spec 110
