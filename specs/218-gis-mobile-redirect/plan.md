# Plan 218: GIS redirect on mobile and installed PWA

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 179 popup, 119 session, 178 production GIS

## Why

On Chrome Android the official **Sign in with Google** button opens a Google window. After the account is chosen the window closes and Settings stays signed out. No Cloud Sync error.

Spec 179 locked `ux_mode: 'popup'` and listed Android as out of scope. Desktop popup still works: GIS `postMessage`s the ID token to the opener and `callback` runs `POST /v1/auth/google`. Chrome Android (and an installed standalone PWA) treat that window as a tab. When it closes, the opener never gets the JWT.

## Approach

Keep Spec 179 popup on desktop browser tabs.

On Android, iOS, and `display-mode: standalone`, initialize GIS with `ux_mode: 'redirect'` and `login_uri` on the API. Google POSTs the JWT to that URI (full-page, same tab). The API verifies the token the same way as today, does **not** create a session (the client still has to send `localHasData`), and 302s to `/settings` with the JWT in the URL hash. The web app reads the hash once, strips it, and runs the existing `onGoogleCredential` / conflict / onboarding path.

Fake Google and Playwright stay click-the-button. No One Tap `prompt()`. Do not turn on `use_fedcm_for_button` in this slice — Spec 179 already saw FedCM One Tap fail silently on Cloud Run.

## Scope / edges

**In:** Mobile/standalone redirect UX; API GIS callback bounce; consume hash on Settings; HOSTING authorized redirect URI.

**Out:** Desktop popup, GIS button chrome, One Tap, FedCM button, Android native app (122), publishing the OAuth app.
