# Tasks 183: Onboarding passphrase live check

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted (implement the attached plan)
- [x] Branch `feat/183-onboarding-passphrase-live-check`
- [x] TDD: `apps/web/src/lib/application/new-passphrase-fields.test.ts` — empty quiet; short; match; canSubmit
- [x] Shared `NewPassphraseFields.svelte`; MorePanel + AccountPassphraseScreen
- [x] Playwright: `e2e/cloud-auth.e2e.ts` Continue disabled until valid
- [x] `npm run check` + `npm run test:unit:run` + cloud-auth e2e
- [ ] Commit linking Spec 183
