# Tasks 153: Delete pocket from the edit form

Draft — do not implement until Ronald Accepts. Land **after** 152 (active-goal guard).

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/153-pocket-delete-edit-form` after Accept (this Draft may live on `docs/153-pocket-delete-edit-form`)
- [ ] **Red Vitest** `apps/web/src/lib/application/accounts.test.ts` — Main refuse; voided tx blocks; active goal blocks; empty non-Main deletes; thrown copy does not tell the user to void
- [ ] **Green** `deletePocket` messages in `apps/web/src/lib/application/accounts.ts` (152 already owns the active-goal check + past-row cascade)
- [ ] UI: danger block above Cancel/Save on non-Main edit; `pocket-delete`; ConfirmDialog `pocket-delete-confirm`; Popover `pocket-delete-blocked`; hide on Main/create
- [ ] After successful delete from details, `goto('/pockets')`
- [ ] Playwright `e2e/pockets.e2e.ts` + `e2e/pocket-details.e2e.ts`
- [ ] Docs: `docs/PRODUCT.md` Pockets delete home; index this spec Accepted in the same PR as the code
- [ ] `npm run check` + targeted unit/e2e
