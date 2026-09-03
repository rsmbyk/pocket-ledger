# Tasks 152: Multiple goals per pocket

Draft — do not implement until Ronald Accepts.

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/152-pocket-multi-goals` after Accept (this Draft may live on `docs/152-pocket-multi-goals`)
- [ ] **Red Vitest** `apps/web/src/lib/domain/goals.test.ts` — classify active/past/hidden; `sortActiveGoals` / `sortPastGoals` / `previewGoal`; Dropped vs Achieved vs Missed; `assertGoalTarget`; date min today
- [ ] **Green** helpers on `apps/web/src/lib/domain/goals.ts` (replace legacy `Goal` / `name` / `savedMinor`)
- [ ] **Red Vitest** `apps/web/src/lib/domain/pocket-balance.test.ts` — `goalEndOfDayBalance` / `dayAfter`: txs on `targetOn` count; txs after that day do not
- [ ] **Green** helper next to `balanceAtDayStart` in `apps/web/src/lib/domain/pocket-balance.ts`
- [ ] **Red Vitest** `apps/web/src/lib/application/goals.test.ts` — migrate account fields → one row; create/update active only; Drop dated vs no-date; never `db.goals.delete`
- [ ] **Green** Dexie bump + migrate in `apps/web/src/lib/data/db.ts`; rewrite `apps/web/src/lib/application/goals.ts` + `apps/web/src/lib/data/goals-repo.ts`; backup + `field-crypto` `description`
- [ ] **Red Vitest** `apps/web/src/lib/application/accounts.test.ts` — `deletePocket` refuses active goals; allows when only past/hidden; cascade `deletedAt` on leftover past rows
- [ ] **Green** `deletePocket` in `apps/web/src/lib/application/accounts.ts`; strip goal fields from `updatePocket` / create drafts
- [ ] UI: always-on Goals card; Add Goal; empty; list chrome; past modal; goal dialog + Drop confirm; list preview; remove pocket-form goal block
- [ ] Sync: `kind: 'goal'` on signed-in PUT/GET
- [ ] Playwright `e2e/goals.e2e.ts` + `e2e/pocket-details.e2e.ts` + list preview in `e2e/pockets.e2e.ts`
- [ ] Docs: `docs/PRODUCT.md`, `docs/DATA_MODEL.md`; index this spec Accepted in the same PR as the code
- [ ] `npm run check` + targeted unit/e2e
