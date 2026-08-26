# Tasks 119: Google Sign-In, account passphrase, hex kit, session manager

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [ ] TDD: onboarding state machine (resume steps) — `apps/api` and/or `apps/web` application tests (name files in implement PR)
- [ ] TDD: session issue/refresh/revoke
- [ ] GIS + ID token verify + 7-day cookie + CORS
- [ ] New-account set passphrase + hex kit (copy or download + checkbox); wrap upload after confirm
- [ ] Returning enter passphrase or hex
- [ ] Local-vs-cloud discard warning
- [ ] Sign-out wipe; start-fresh same
- [ ] Session manager UI
- [ ] Account passphrase replaces device passphrase (notify); cannot remove
- [ ] Device skip warning (exact copy); distinct UIs
- [ ] Device wrong-guess ladder (typed only)
- [ ] Screensaver / idle: drop DEK; continue vs unlock copy; 5/10/15/30 default 30; leave-tab default on
- [ ] Optional WebAuthn this-device third box (cold + idle)
- [ ] Playwright onboarding + cannot skip
- [ ] `specs/README.md` 119 Accepted when landing
- [ ] Commit + draft PR linking Spec 119
