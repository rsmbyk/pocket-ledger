# Tasks 181: Debug fake signup (temporary)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted (implement the attached plan)
- [x] Branch `feat/181-debug-fake-signup`
- [x] TDD: `apps/api/src/verify-google.test.js` — fake allow / `AUTH_FAKE_SUB` reject / real path unchanged
- [x] Extract `apps/api/src/verify-google.js`; wire `index.js`; `package.json` check
- [x] TDD: `apps/web/src/lib/application/cloud-api.test.ts` — `DEBUG_FAKE_GOOGLE_SUB` / `shouldWipeCloudOnSignOut`
- [x] Settings button + confirm; wipe local then fixed token; sign-out branch
- [x] `deploy-api.yml` `AUTH_ALLOW_FAKE=1,AUTH_FAKE_SUB=pl-debug-cursor`
- [x] HOSTING: temporary production fake-sub exception; do not un-park PRODUCT wipe-account
- [x] `npm run check` + `npm run test:unit:run`
- [ ] Commit linking Spec 181
