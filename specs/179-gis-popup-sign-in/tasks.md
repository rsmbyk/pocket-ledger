# Tasks 179: GIS popup sign-in (not One Tap)

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Branch `feat/179-gis-popup-sign-in` off `main`
- [x] TDD: `apps/web/src/lib/application/google-signin.test.ts` — mock `window.google`; `renderButton` + `ux_mode: 'popup'`; never `prompt()`; credential callback; reject if script / `accounts.id` missing
- [x] `google-signin.ts` helper: mount GIS button (not One Tap)
- [x] Settings Cloud Sync: GIS host when real client id; shadcn button when fake Google; `data-testid="google-sign-in"` on both
- [x] Wire credential into existing `finishGoogle` / `wrap()` error line
- [x] HOSTING.md: production GIS is button/popup, not One Tap
- [x] `npm run check` + `npm run test:unit:run` (web google-signin)
- [x] Commit linking Spec 179
