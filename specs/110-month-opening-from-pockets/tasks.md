# Tasks 110: Month opening from pocket openings

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/pocket-balance.test.ts` — `balanceAtDayStart` (equal as-of; forward; reverse mid-gap expense; voided ignored)
- [x] **Green** helper in `src/lib/domain/pocket-balance.ts`
- [x] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — Opening = sum of day-start balances; Ending = Opening + Net; update prior-tx / fee fixtures to pass pockets
- [x] **Green** `buildMonthSummary` takes pockets and uses inferred Opening
- [x] **Red/Green Vitest:** `src/lib/application/month-summary.test.ts` — load passes pockets into summary
- [x] Playwright: `e2e/month-opening-from-pockets.e2e.ts` — mid-gap expense before as-of → June Opening reflects reverse
- [x] `npm run check` + unit (+ e2e) green
- [x] Traceability in `./spec.md`
- [x] Commit + draft PR linking Spec 110
