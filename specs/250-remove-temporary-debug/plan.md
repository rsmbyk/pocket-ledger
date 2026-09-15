# Plan 250: Remove temporary debug

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 180, 181, 178
- **Related:** 119

## What

Remove Specs 180–181 from production and Settings. No fake GIS signup beside the official button. No reset-cloud buttons. Cloud Run never accepts `fake.*` tokens. Local/e2e fake Google stays.

## Why

Production debug signup and cloud wipe were temporary. GIS works. Wipe-account stays parked in PRODUCT.

## Out of this slice

- Un-parking wipe/delete account
- Local `AUTH_ALLOW_FAKE` / `VITE_FAKE_GOOGLE` for host and Playwright
- Mass Prettier
