# Tasks 103: Create-form draft on discard (session)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/shared/create-form-drafts.test.ts` — round-trip tx/pocket/category; malformed → null; clear; per-key isolation
- [x] **Green** `src/lib/shared/create-form-drafts.ts`
- [x] Extend `ConfirmDialog` with optional secondary action (Save draft)
- [x] Wire `QuickAddSheet` create: restore dirty, three-action discard, clear on success/Discard
- [x] Wire `PocketsPanel` create: prevent-then-warn + draft restore/clear
- [x] Wire `CategoriesPanel` create: prevent-then-warn + per-kind draft
- [x] Playwright: `e2e/create-form-drafts.e2e.ts`
- [x] `npm run check` + unit + e2e
- [x] Traceability in `./spec.md`
- [x] Commit with pack
