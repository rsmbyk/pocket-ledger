# Tasks 106: Transfer admin fee

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/domain/transfer-rules.test.ts` — optional fee blank→0; digits; reject negative; amount+fee fields
- [ ] **Green** `buildTransferFields` / fee parse in `src/lib/domain/transfer-rules.ts` (+ shared non-neg parse if needed)
- [ ] **Red Vitest:** `src/lib/domain/pocket-balance.test.ts` — source `-(amount+fee)`, dest `+amount`; fee `0` unchanged
- [ ] **Green** `pocketDelta` in `src/lib/domain/pocket-balance.ts`
- [ ] **Red Vitest:** `src/lib/domain/month-summary.test.ts` — fee in expenseMinor + Admin Fee bucket; opening reduced by prior fees; order Admin Fee before Uncategorized
- [ ] **Green** `buildMonthSummary` in `src/lib/domain/month-summary.ts`
- [ ] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — Admin Fee sentinel matches transfers with `feeMinor > 0`
- [ ] **Green** filter predicate + `ADMIN_FEE_CATEGORY_ID` in `src/lib/domain/activity-filters.ts`
- [ ] **Red Vitest:** `src/lib/application/transactions.test.ts` — addTransfer/updateTransfer persist `feeMinor`; income/expense write `0`
- [ ] **Green** `src/lib/application/transactions.ts` + `LedgerTransaction.feeMinor` in `src/lib/domain/transaction.ts`
- [ ] Normalize missing `feeMinor` → `0` on read/backup restore (repo and/or import path) + Vitest
- [ ] **Red/Green:** `src/lib/shared/create-form-drafts.test.ts` — Transfer draft includes fee
- [ ] UI: Fee field on Transfer tab in `src/lib/ui/QuickAddSheet.svelte` (create + edit)
- [ ] UI: fee line on `src/lib/ui/TransactionListRow.svelte` when `feeMinor > 0`
- [ ] UI: Admin Fee in month expense chart + Activity category filter (marker + order before Uncategorized); no Categories-panel row; no normal category picker option
- [ ] Playwright: `e2e/transfer-admin-fee.e2e.ts` (and extend `e2e/pockets.e2e.ts` if needed) — create with fee; blank fee; edit; void; filter; chart order; row chrome
- [ ] Update `docs/PRODUCT.md` + `docs/DATA_MODEL.md`
- [ ] `npm run check` + unit + e2e green
- [ ] Traceability in `./spec.md`
- [ ] Commit + draft PR linking Spec 106
