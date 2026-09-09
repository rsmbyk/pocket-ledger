# Tasks 242: Pocket details Transfers bucket

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/242-month-summary-pocket-transfers`
- [x] **Red Vitest:** `apps/web/src/lib/domain/month-summary.test.ts` — in/out/net; fee not in TransferNet; voided ignored; pocket Ending = `balanceAtDayStart` of next month; Home Ending unchanged with transfers
- [x] **Green** `buildMonthSummary` in `apps/web/src/lib/domain/month-summary.ts`
- [x] UI: Transfers chart + footer on pocket details only (`showTransfers` on `MonthSummary.svelte`)
- [x] Playwright: `e2e/pocket-details.e2e.ts` — in/out chart + Ending after a transfer; `e2e/month-charts.e2e.ts` still has no Transfers section
- [x] `docs/PRODUCT.md` pocket Ending identity; spec 148 Ending note
- [x] Index in `specs/README.md`
- [x] Commit linking Spec 242
