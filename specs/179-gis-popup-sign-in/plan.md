# Plan 179: GIS popup sign-in (not One Tap)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119 Google session, 154 Settings hub, 178 production GIS client id

## Why

Iowa Settings shows **Sign in with Google**, but a click does nothing. Production uses `google.accounts.id.prompt()` (One Tap / FedCM). Chrome returns `FedCM get() rejects with NetworkError: Error retrieving a token`, and our helper never resolves or rejects — so `wrap()` shows no error.

A labeled Sign-in control should open GIS **popup / official button**, not One Tap. Local/e2e fake Google stays a normal button click.

## Approach

For real GIS: `initialize` + `renderButton` with `ux_mode: 'popup'`. Credential JWT still goes to `POST /v1/auth/google`. Load/init failures reject into the existing Cloud Sync error line. Fake Google (`VITE_FAKE_GOOGLE`) keeps the shadcn button and `data-testid="google-sign-in"`.

## Scope / edges

**In:** Replace One Tap `prompt()`; surface GIS failures; keep fake Google + Playwright; HOSTING one-liner that production uses the GIS button/popup.

**Out:** OAuth verification / Publish app, FedCM browser settings, Jakarta teardown, API token verify changes, Android.
