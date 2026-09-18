# Tasks 252: Lock zoom in the installed PWA

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Red: `apps/web/src/lib/shared/page-zoom.test.ts` — tab meta unchanged; standalone / iOS standalone lock; neither flag no-op; second pass no-op
- [x] Green: `apps/web/src/lib/shared/page-zoom.ts`
- [x] Head inline lock in `apps/web/src/app.html` and `apps/web/public/offline.html` (same strings / detection as the helper)
- [x] `@media (display-mode: standalone)` `touch-action: pan-x pan-y` on `html` in `apps/web/src/app.css`
- [x] Layout `onMount` second pass via the helper (idempotent)
- [x] Playwright `e2e/scaffold.e2e.ts` — tab viewport; `navigator.standalone` init script → locked meta
- [x] PRODUCT UX/PWA line; `specs/README.md` index
- [x] Commit linking Spec 252
