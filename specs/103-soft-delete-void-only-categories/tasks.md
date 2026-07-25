# Tasks 103: Soft-delete categories used only by voided txs

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/application/categories.test.ts` — void-only soft-delete; active rejects; unused hard-delete; soft-deleted hidden from list; name reusable; display lookup includes soft-deleted
- [x] Dexie / `CategoryRow.deletedAt` + migration in `src/lib/data/db.ts`
- [x] Repo/app: list active vs all; usage split; `removeCategory` soft/hard in `src/lib/data/category-repo.ts`, `src/lib/application/categories.ts`
- [x] Backup normalize `deletedAt` in `src/lib/application/backup.ts` (+ test if covered)
- [x] UI: active-only in-use check in `src/lib/ui/CategoriesPanel.svelte`; display map includes soft-deleted in `src/App.svelte`
- [x] Playwright: `e2e/categories.e2e.ts` — void-only can delete; active still warns
- [x] `docs/PRODUCT.md` category delete rule
- [x] `npm run check` + unit (+ e2e)
- [ ] Commit + PR linking Spec 103
