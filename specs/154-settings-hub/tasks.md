# Tasks 154: Settings hub

Draft — do not implement until Ronald Accepts.

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/154-settings-hub` after Accept
- [ ] **Red Vitest** `apps/web/src/lib/shared/router.test.ts` — `/settings` → `settings`; `/more` alias; `routeToPath('settings')` is `/settings`
- [ ] **Green** `apps/web/src/lib/shared/router.ts`; Kit stub `apps/web/src/routes/settings/+page.svelte`; replace-navigate `/more`
- [ ] UI: nav label + Settings icon; `nav-settings`; uniform card chrome + order; Cloud Sync title; rename panel testids
- [ ] Command palette + docs (PRODUCT, ARCHITECTURE, AGENTS)
- [ ] Playwright `e2e/router.e2e.ts`, `e2e/base-features.e2e.ts`, other `more` / `nav-more` e2e
- [ ] Index this spec Accepted in the same PR as the code
- [ ] `npm run check` + targeted unit/e2e
