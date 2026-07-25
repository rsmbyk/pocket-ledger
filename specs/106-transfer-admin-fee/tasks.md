# Tasks 106: Transfer admin fee

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/transfer-rules.test.ts` — optional fee blank→0; digits; reject negative; amount+fee fields
- [x] **Green** `buildTransferFields` / fee parse in `src/lib/domain/transfer-rules.ts` (+ shared non-neg parse if needed)
- [x] **Red Vitest:** `src/lib/domain/pocket-balance.test.ts` — source `-(amount+fee)`, dest `+amount`; fee `0` unchanged
- [x] **Green** `pocketDelta` in `src/lib/domain/pocket-balance.ts`
- [x] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — fee in expenseMinor + Admin Fee bucket; opening reduced by prior fees; order Admin Fee before Uncategorized
- [x] **Green** `buildMonthSummary` in `src/lib/domain/month-summary.ts`
- [x] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — Admin Fee sentinel matches transfers with `feeMinor > 0`
- [x] **Green** filter predicate + `ADMIN_FEE_CATEGORY_ID` in `src/lib/domain/activity-filters.ts`
- [x] **Red Vitest:** `src/lib/application/transactions.test.ts` — addTransfer/updateTransfer persist `feeMinor`; income/expense write `0`
- [x] **Green** `src/lib/application/transactions.ts` + `LedgerTransaction.feeMinor` in `src/lib/domain/transaction.ts`
- [x] Normalize missing `feeMinor` → `0` on read/backup restore (repo and/or import path) + Vitest
- [x] **Red/Green:** `src/lib/shared/create-form-drafts.test.ts` — Transfer draft includes fee
- [x] UI: Fee field on Transfer tab in `src/lib/ui/QuickAddSheet.svelte` (create + edit)
- [x] UI: fee line on `src/lib/ui/TransactionListRow.svelte` when `feeMinor > 0`
- [x] UI: Admin Fee in month expense chart + Activity category filter (marker + order before Uncategorized); no Categories-panel row; no normal category picker option
- [x] Playwright: `e2e/transfer-admin-fee.e2e.ts` (and extend `e2e/pockets.e2e.ts` if needed) — create with fee; blank fee; edit; void; filter; chart order; row chrome
- [x] Update `docs/PRODUCT.md` + `docs/DATA_MODEL.md`
- [x] `npm run check` + unit + e2e green
- [x] Traceability in `./spec.md`
- [x] Commit + draft PR linking Spec 106
