# Tasks 159: Settings reset (local-only)

Draft — do not implement until Ronald Accepts. Land after 154 (and after 155/156 keys exist, or keep idle keys only until currency lands).

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/159-settings-reset` after Accept
- [ ] **Red Vitest** `apps/web/src/lib/application/reset.test.ts` — wipe categories always; preserveSettings keeps currency + idle; preservePassphrase unchanged
- [ ] **Green** `resetLocalData` options; Settings danger card; confirm keep flags + passphrase field
- [ ] Playwright reset flows
- [ ] Docs; index Accepted with the code PR
- [ ] `npm run check` + targeted unit/e2e
