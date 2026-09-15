# Tasks 250: Remove temporary debug

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/250-remove-temporary-debug`
- [x] **Red** `apps/api/src/app.test.js` — `POST /v1/debug/reset-cloud` is 404 (session or not)
- [x] **Green** delete the route; drop `deleteAccount` / `resetAccountKeepSession` + their store tests
- [x] **Red/green** `verify-google.test.js` — drop `AUTH_FAKE_SUB`; keep allowFake on/off and e2e emails
- [x] `deploy-api.yml`: no fake env; `--remove-env-vars=AUTH_ALLOW_FAKE,AUTH_FAKE_SUB`
- [x] Strip debug UI, `cloud-api.ts` helpers, App.svelte handlers; drop debug describe in `cloud-api.test.ts`
- [x] Playwright: drop debug-reset cases; assert debug controls absent
- [x] Mark 180/181 Superseded; index Spec 250
