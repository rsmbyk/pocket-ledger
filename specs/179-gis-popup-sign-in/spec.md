# Spec 179: GIS popup sign-in (not One Tap)

- **ID:** 179
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** must open a Google account picker (GIS button / popup) and either complete sign-in or show an error. It must not call One Tap `prompt()` or hang with a blank UI when FedCM fails.

## Scope

### In scope

1. Real GIS (client id set, fake Google off): mount Google Identity Services **Sign in with Google** via `google.accounts.id.renderButton`, `ux_mode: 'popup'`. Do **not** call `google.accounts.id.prompt()`.
2. GIS `callback` still yields the ID token JWT; existing `signInWithGoogleToken` / conflict / onboarding unchanged.
3. If the GIS script fails to load, `accounts.id` is missing, or initialize/render throws: show an error on the Cloud Sync card (existing alert). Never leave a Promise pending with no UI.
4. Fake Google (`VITE_FAKE_GOOGLE=1` / `true`): keep the current shadcn **Sign in with Google** button and `data-testid="google-sign-in"` click path.
5. Production GIS host also uses `data-testid="google-sign-in"` (wrapper around the GIS widget). Visible stretch is [210](../210-gis-button-stretch/spec.md).
6. HOSTING: production uses GIS button/popup, not One Tap; JS origin + Testing test users unchanged.

### Out of scope

- Publishing the OAuth app / Google verification
- Changing API `tokeninfo` verification or Cloud SQL
- Browser FedCM / third-party sign-in settings
- Deleting Jakarta Cloud Run
- Android

## Domain rules

- Local / CI / e2e stay fake Google. Playwright must keep clicking `google-sign-in` without a real GIS popup.
- Operator still never sees passphrase, hex, or raw DEK.
- Official GIS button chrome (Google’s widget) is OK; do not reimplement One Tap as a fallback.
- Closing the Google popup without a credential is not a hang: stay signed out, no spinner forever. Optional short error if GIS reports cancel; silent stay-signed-out is OK if GIS gives no error.

## Acceptance scenarios

### Scenario: Fake Google is unchanged

- **Given** `VITE_FAKE_GOOGLE=1` and Cloud Sync is configured
- **When** the user clicks `google-sign-in`
- **Then** the app uses the fake token path (no GIS script required)
- **And** existing Playwright cloud-auth / sync-conflict flows still pass

### Scenario: Production uses GIS button/popup, not One Tap

- **Given** a production-like web build (`VITE_GOOGLE_CLIENT_ID` set, fake Google off)
- **When** Settings → Cloud Sync renders while signed out
- **Then** the app loads `https://accounts.google.com/gsi/client` and calls `initialize` + `renderButton` with that client id and `ux_mode: 'popup'`
- **And** it does not call `prompt()`

### Scenario: GIS credential completes the same session flow

- **Given** GIS `callback` returns a `credential` JWT
- **When** that callback runs
- **Then** the client POSTs `/v1/auth/google` with that `idToken` (same as today)
- **And** passphrase / hex onboarding still follows Spec 119

### Scenario: GIS failure is visible

- **Given** production Cloud Sync and GIS fails to load or `google.accounts.id` is missing
- **When** the Settings cloud section tries to mount GIS
- **Then** the Cloud Sync error alert shows a message (not a hang, not a silent no-op)

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts` — `renderButton` + popup, no `prompt()`, resolve credential, reject on missing GIS / script error
- Playwright: existing `e2e/cloud-auth.e2e.ts` and `e2e/sync-conflict.e2e.ts` (fake Google; no new GIS popup e2e)
- Implementation: `apps/web/src/lib/application/google-signin.ts`, `apps/web/src/App.svelte`, `apps/web/src/lib/ui/MorePanel.svelte`, `docs/HOSTING.md`

## Related

- 119 Google session
- 154 Settings hub (`google-sign-in` testid)
- 178 Production Cloud SQL + client id bake (explicitly deferred GIS prompt UX)
