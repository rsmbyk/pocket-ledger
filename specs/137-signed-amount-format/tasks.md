# Tasks 137: Signed amounts after currency

Draft — do not implement until Ronald Accepts.

- [ ] Branch: `feat/137-signed-amount-format` after Accept
- [ ] **Red/Green Vitest** `apps/web/src/lib/domain/money.test.ts` — negative `formatMinor`
- [ ] `TransactionListRow`: expense `formatMinor(-n)`; income `formatMinor(n)`; transfer unchanged
- [ ] Playwright smoke on row amount text
- [ ] Manual: Transactions + Home Recent + month net look the same for negatives
