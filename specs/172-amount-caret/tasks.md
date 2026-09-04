# Tasks 172: Amount field caret stays put

Draft — do not implement until Ronald Accepts.

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/172-amount-caret` off `main` after Accept
- [ ] **Red Vitest** `apps/web/src/lib/domain/transaction-rules.test.ts` — caret after delete-first and mid-insert
- [ ] **Green** helper; restore caret on goal Target, opening, tx Amount, transfer amount, transfer fee
- [ ] Playwright `e2e/goals.e2e.ts` — `selectionStart` after Backspace / mid-type
- [ ] Point 105 at 172
- [ ] Index Accepted with the code PR
- [ ] `npm run check` + targeted unit/e2e
