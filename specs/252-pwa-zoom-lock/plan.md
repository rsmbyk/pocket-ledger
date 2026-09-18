# Plan 252: Lock zoom in the installed PWA

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 000 scaffold, 117 PWA, 111 mobile 16px inputs

## Why

The installed PWA still pinch- and double-tap-zooms because the viewport is `width=device-width, initial-scale=1.0, viewport-fit=cover` with no scale lock. That feels accidental on a home-screen app. Browser tabs must stay zoomable for accessibility. Inputs already use `text-base` on small screens (111), so iOS focus-zoom is not this slice.

## Approach

Detect an installed PWA with Chromium `display-mode: standalone` **or** iOS `navigator.standalone`. Only then:

1. Rewrite the viewport meta to add `maximum-scale=1.0, user-scalable=no` (keep `viewport-fit=cover` on the app shell).
2. CSS `@media (display-mode: standalone)` on `html`: `touch-action: pan-x pan-y`.
3. `preventDefault` on iOS `gesturestart` / `gesturechange` / `gestureend`.

Run a head inline script in `app.html` and `offline.html` so the lock exists before first paint. Mirror detection and viewport strings in `apps/web/src/lib/shared/page-zoom.ts` for Vitest and an idempotent layout second pass.

## Scope / edges

**In:** Installed-PWA zoom lock; tab viewport unchanged; helper + tests; PRODUCT line.

**Out:** Tab pinch/double-tap; keyboard / Ctrl+wheel zoom; input font sizes; Android native (122).

Honest limit: Android Chrome PWA usually honors the viewport; iOS may still pinch without the gesture listeners. Not a 100% OS-level block.
