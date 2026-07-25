# Tasks 103: Pocket amount fields match Amount

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/transaction-rules.test.ts` — `parseNonNegativeAmountInput` blank/`0`/grouped/`15000`; reject negative and non-digits
- [x] **Green** `parseNonNegativeAmountInput` in `src/lib/domain/transaction-rules.ts`
- [x] **Red Vitest:** `src/lib/application/accounts.test.ts` — create/update reject `openingBalanceMinor < 0`
- [x] **Green** reject negatives in `src/lib/application/accounts.ts`
- [x] Wire Opening + Goal target in `src/lib/ui/PocketsPanel.svelte` to Amount InputGroup chrome; clamp legacy negative on edit load; remove `parseSignedAmount`
- [x] Playwright: `e2e/pockets.e2e.ts` — currency prefix; type `15000` → `15,000`; opening `0` saves
- [x] `npm run check` + unit + e2e green
- [x] Traceability in `./spec.md`
- [x] Commit + draft PR linking Spec 103
