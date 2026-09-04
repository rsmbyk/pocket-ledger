# Tasks 180: Debug reset cloud (temporary)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted (implement the attached plan)
- [x] Branch `feat/180-debug-reset-cloud`
- [x] TDD: `apps/api/src/memory-store.test.js` — `deleteAccount` / `resetAccountKeepSession`
- [x] TDD: `apps/api/src/postgres-store.test.js` — same against fake pool
- [x] TDD: `apps/api/src/app.test.js` — `POST /v1/debug/reset-cloud` 401 / signOut true / signOut false
- [x] Store + `POST /v1/debug/reset-cloud`
- [x] Settings two buttons + confirms; client wipe + reload
- [x] Playwright: both paths in `e2e/cloud-auth.e2e.ts`
- [x] Do not un-park PRODUCT wipe-account
- [x] `npm run check` + unit + e2e cloud-auth
- [x] Commit linking Spec 180
