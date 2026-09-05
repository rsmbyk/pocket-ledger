# Tasks 211: Stale account unlock after the session is gone

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] TDD: `apps/web/src/lib/application/cloud-session.test.ts` — unauthorized / drop-session / auth epoch
- [x] `apps/web/src/lib/application/cloud-session.ts` + `App.svelte` — clear signed-in on `fetchMe` null; reload on wrap 401, visible + null me, sign-out epoch
- [x] Playwright `e2e/cloud-auth.e2e.ts` — cookie gone → device unlock/app, never `unauthorized`; live session wrong pass **Incorrect passphrase**; sibling tab after sign-out
- [x] Commit linking Spec 211
