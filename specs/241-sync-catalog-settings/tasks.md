# Tasks 241: Sync pockets, category overlay, and settings

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/241-sync-catalog-settings`
- [x] TDD: `apps/web/src/lib/application/sync-client.test.ts` — pull applies account/category/categoryGroup; allowlisted settings; skip lock keys; catch-up PUT missing revs; drop unused seed Main
- [x] Green: `pullAndApply`, `catchUpPushLocal`, `pushSealedEntityIfSignedIn` in `sync-client.ts`
- [x] Push on pocket CRUD/reorder, category/group/overlay save, currency pocket rewrites, theme change
- [x] Signed-in bootstrap: skip seed while locked; unlock calls bootstrap; pull then catch-up then `ensureDefaultAccount` if still empty
- [x] Playwright: `e2e/sync-catalog.e2e.ts` two contexts, shared fake token
- [x] Index in `specs/README.md`
- [x] Commit linking Spec 241
