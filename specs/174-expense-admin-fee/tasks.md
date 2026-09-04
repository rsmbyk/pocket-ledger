# Tasks 174: Expense admin fee

Draft — do not implement until Ronald Accepts.

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/174-expense-admin-fee` off `main` after Accept
- [ ] **Red Vitest** `apps/web/src/lib/domain/pocket-balance.test.ts` — expense with fee
- [ ] **Red Vitest** `apps/web/src/lib/domain/month-summary.test.ts` — expense fee → Admin Fee; prior-month opening
- [ ] **Red Vitest** `apps/web/src/lib/domain/activity-filters.test.ts` — Admin Fee matches expenses; Expense type may select Admin Fee
- [ ] **Red Vitest** `apps/web/src/lib/application/transactions.test.ts` — persist expense fee; income `0`
- [ ] **Red Vitest** `apps/web/src/lib/shared/create-form-drafts.test.ts` — `expenseFeeDigits`
- [ ] **Green** domain + application + drafts
- [ ] UI: Fee on expense create/edit; hide on income; list row; Admin Fee in Expense filter
- [ ] Playwright expense-fee save + Income has no Fee
- [ ] Docs PRODUCT + DATA_MODEL; point 106 / 107 at 174
- [ ] Index Accepted with the code PR
- [ ] `npm run check` + targeted unit/e2e
