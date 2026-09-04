# Tasks 172: Amount field caret stays put

- [x] Spec Accepted by Ronald
- [x] Implement on `feat/173-177-tx-chrome` (172 needs expense fee from 174; stacked on 173–177)
- [x] **Red Vitest** `apps/web/src/lib/domain/transaction-rules.test.ts` — caret after delete-first and mid-insert
- [x] **Green** helper; restore caret on goal Target, opening, tx Amount, transfer amount, transfer fee, expense fee
- [x] Playwright `e2e/goals.e2e.ts` — `selectionStart` after Backspace / mid-type
- [x] Point 105 at 172
- [x] Index Accepted with the code PR
- [x] `npm run check` + targeted unit/e2e
