# Tasks 047: Transaction sheet polish

- **Status:** Draft (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/047-tx-sheet-polish` from current base (`main` or merged 043–046 tip)
- [ ] Red Vitest: N/A
- [ ] Red Playwright: add `e2e/tx-sheet-polish.e2e.ts`
  - [ ] Void outlined danger + present in edit header
  - [ ] Label click on Amount/Category/Date/Note does not open/focus control
  - [ ] DateField: open then click trigger again → picker not left open (assert closed / `aria-expanded` if exposed)
  - [ ] Optional: menu item computed style `cursor` is `pointer`
- [ ] Green UI: `QuickAddSheet.svelte`, `DateField.svelte`, `dropdown-menu-item.svelte` (+ siblings if needed)
- [ ] Playwright green; existing `e2e/polish.e2e.ts` / `e2e/transactions.e2e.ts` still pass
- [ ] `npm run check` + `test:unit:run` + targeted e2e
- [ ] Fill Traceability in `./spec.md`
- [ ] Commit Conventional Commit + draft PR linking `./spec.md`
- [ ] Visual check: currency prefix left/right padding looks even

## Notes

Prefer scoping Playwright to the tx dialog/sheet so Home “Hide money” never collides with Amount.
