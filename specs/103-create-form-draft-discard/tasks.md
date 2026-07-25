# Tasks 103: Create-form draft on discard (session)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/shared/create-form-drafts.test.ts` — round-trip tx/pocket/category; malformed → null; clear; per-key isolation
- [ ] **Green** `src/lib/shared/create-form-drafts.ts`
- [ ] Extend `ConfirmDialog` with optional secondary action (Save draft)
- [ ] Wire `QuickAddSheet` create: restore dirty, three-action discard, clear on success/Discard
- [ ] Wire `PocketsPanel` create: prevent-then-warn + draft restore/clear
- [ ] Wire `CategoriesPanel` create: prevent-then-warn + per-kind draft
- [ ] Playwright: `e2e/create-form-drafts.e2e.ts`
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit with pack
