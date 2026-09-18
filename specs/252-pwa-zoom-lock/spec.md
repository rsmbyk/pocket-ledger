# Spec 252: Lock zoom in the installed PWA

- **ID:** 252
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

An installed Pocket Ledger PWA must not pinch- or double-tap-zoom. The same origin in a normal browser tab stays zoomable.

## Scope

### In scope

1. Detect installed as Chromium `display-mode: standalone` **or** iOS `navigator.standalone` (home-screen). Spec 218’s GIS helper may keep `matchMedia` only; this slice includes the iOS flag.
2. **Tab** viewport stays `width=device-width, initial-scale=1.0, viewport-fit=cover` — no `user-scalable=no`, no `maximum-scale`.
3. **Installed** viewport adds `maximum-scale=1.0, user-scalable=no` and keeps `viewport-fit=cover` on the app shell. Offline page keeps its own base viewport and only appends those two tokens when installed.
4. CSS `@media (display-mode: standalone)` on `html`: `touch-action: pan-x pan-y`.
5. While locked, `preventDefault` on `gesturestart`, `gesturechange`, and `gestureend`.
6. Head inline script in `app.html` and `offline.html` so the lock applies before first paint. Shared helper `page-zoom.ts` owns the same strings and detection; layout may call it again if the document is not already marked locked.
7. PRODUCT: installed PWA does not pinch-zoom; browser tabs still can.

### Out of scope

- Pinch or double-tap zoom in a browser tab
- Keyboard or Ctrl/Cmd+wheel zoom
- Changing input font sizes (Spec 111 already uses 16px on mobile)
- Android native app (122)

## Domain rules

- Installed ⇔ `display-mode: standalone` matches **or** `navigator.standalone === true`.
- Neither flag ⇔ do not rewrite the viewport, do not attach gesture listeners.
- Lock is idempotent (`data-pl-zoom-lock` on `html`): a second pass must not stack listeners or mutate an already-locked meta.
- Android Chrome PWA usually honors `user-scalable=no`. Safari often ignores the meta; the gesture listeners are required. This is not a 100% OS-level block.

## Acceptance scenarios

### Scenario: Browser tab stays zoomable

- **Given** the app loads in a normal browser tab (not standalone, not iOS home-screen)
- **When** the document is ready
- **Then** the viewport meta content is `width=device-width, initial-scale=1.0, viewport-fit=cover`
- **And** it does not include `user-scalable=no` or `maximum-scale`

### Scenario: Installed PWA locks the viewport

- **Given** `display-mode: standalone` or `navigator.standalone` is true
- **When** the document head scripts run
- **Then** the viewport meta includes `maximum-scale=1.0` and `user-scalable=no`
- **And** the app-shell meta still includes `viewport-fit=cover`
- **And** `html` has `data-pl-zoom-lock`

### Scenario: iOS home-screen is treated as installed

- **Given** `navigator.standalone` is true and `display-mode: standalone` is false
- **When** the lock helper runs
- **Then** the viewport is rewritten as in the installed scenario
- **And** gesture `preventDefault` listeners are attached

### Scenario: Second pass is a no-op

- **Given** the document is already marked `data-pl-zoom-lock`
- **When** the layout helper runs
- **Then** the viewport content is unchanged
- **And** no additional gesture listeners are attached

## Traceability

- Vitest: `apps/web/src/lib/shared/page-zoom.test.ts` — tab → current meta; `standalone` / `navigator.standalone` → locked meta; neither flag → no lock; second pass no-op
- Playwright: `e2e/scaffold.e2e.ts` — default load has no `user-scalable=no`; `addInitScript` `navigator.standalone = true` then load → locked content string
- Implementation: `apps/web/src/lib/shared/page-zoom.ts`; head scripts in `apps/web/src/app.html` and `apps/web/public/offline.html`; standalone `touch-action` in `apps/web/src/app.css`; layout second pass
- Docs: `docs/PRODUCT.md`; `specs/README.md`

## Related

- 000 scaffold PWA
- 111 mobile 16px inputs
- 117 path-URL PWA
- 218 GIS standalone detection (matchMedia only)
