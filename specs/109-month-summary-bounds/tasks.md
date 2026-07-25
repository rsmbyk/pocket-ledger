# Tasks 109: Month summary range bounds

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — `resolveMonthBounds` / `clampMonthKey` / `canShiftMonth` (opening vs tx vs voided; future clamp; inclusive edges)
- [x] **Green** helpers in `src/lib/domain/month-summary.ts`
- [x] **Red Vitest:** `src/lib/application/month-summary.test.ts` — load clamps requested month and returns bounds
- [x] **Green** `src/lib/application/month-summary.ts` (+ list accounts for `openingAsOf`)
- [x] UI: `canPrev` / `canNext` on `MonthSummary.svelte`; wire through AppShell / Chrome; App clamps + no-op at bounds
- [x] Playwright: `e2e/month-summary-bounds.e2e.ts` — next disabled on current; prev disabled at earliest opening
- [x] `npm run check` + unit (+ e2e) green
- [x] Traceability in `./spec.md`
- [x] Commit + draft PR linking Spec 109
