# Tasks 166: Import confirm keeps file on wrong passphrase

- [x] Spec Accepted by Ronald
- [x] Branch `feat/166-settings-goals-polish`
- [x] Import confirm: `importPassError` inline; catch failed restore without `wrap()` panel banner
- [x] Do not clear `pendingImportFile` / `importSummary` until restore succeeds
- [x] Playwright `e2e/settings.e2e.ts` — wrong passphrase error + summary kept; retry with correct pass
- [x] Index Accepted with the code PR
- [x] `npm run check` + targeted e2e
