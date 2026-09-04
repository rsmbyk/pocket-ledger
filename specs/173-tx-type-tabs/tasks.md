# Tasks 173: Tx type chrome is always tabs

Draft — do not implement until Ronald Accepts.

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/173-tx-type-tabs` off `main` after Accept
- [ ] **Green UI** `apps/web/src/lib/ui/QuickAddSheet.svelte` — one Tabs.Root (`income | expense | transfer`); drop Normal + Income/Expense button row; edit/void single trigger; drop `tx-type-badge-transfer`
- [ ] Playwright `e2e/pockets.e2e.ts` — no `tx-mode-normal`; create ≥2 pockets has `tx-type-income`, `tx-mode-transfer`, `tx-type-expense`; default Expense; one pocket omits Transfer; edit income has only `tx-type-income`
- [ ] Playwright `e2e/transfer-admin-fee.e2e.ts` — still `tx-mode-transfer`
- [ ] Point 039 / 073 / 081 at 173
- [ ] Index Accepted with the code PR
- [ ] `npm run check` + targeted e2e
