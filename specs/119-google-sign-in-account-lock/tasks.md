# Tasks 119: Google Sign-In, account passphrase, hex kit, session manager

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] TDD: onboarding state machine (resume steps) — `apps/api` and/or `apps/web` application tests (name files in implement PR)
- [x] TDD: session issue/refresh/revoke
- [x] GIS + ID token verify + 7-day cookie + CORS
- [x] New-account set passphrase + hex kit (copy or download + checkbox); wrap upload after confirm
- [x] Returning enter passphrase or hex
- [x] Local-vs-cloud discard warning
- [x] Sign-out wipe; start-fresh same
- [x] Session manager UI
- [x] Account passphrase replaces device passphrase (notify); cannot remove
- [x] Device skip warning (exact copy); distinct UIs
- [x] Device wrong-guess ladder (typed only)
- [x] Screensaver / idle: drop DEK; continue vs unlock copy; 5/10/15/30 default 30; leave-tab default on
- [x] Optional WebAuthn this-device third box (cold + idle)
- [x] Playwright onboarding + cannot skip
- [x] `specs/README.md` 119 Accepted when landing
- [ ] Commit + draft PR linking Spec 119
