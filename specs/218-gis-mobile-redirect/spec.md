# Spec 218: GIS redirect on mobile and installed PWA

- **ID:** 218
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** on Chrome Android (and other mobile / installed-PWA browsers) must finish the session after the user picks a Google account. Closing Google’s window must not leave Settings signed out with no error when Google actually issued a credential.

## Scope

### In scope

1. Desktop browser tabs keep Spec 179: `renderButton` + `ux_mode: 'popup'` + JS `callback`.
2. Android, iOS, and `display-mode: standalone` use `ux_mode: 'redirect'` and `login_uri` `${VITE_API_URL}/v1/auth/gis-callback`. Still `renderButton`. Still no `prompt()`.
3. `POST /v1/auth/gis-callback` accepts Google’s form (`credential`, `g_csrf_token` + matching cookie), verifies the JWT with existing `verifyGoogle`, does **not** set `pl_session`, and 302s to `${WEB_ORIGIN}/settings#pl_gis=<jwt>` or `/settings#pl_gis_error=1`.
4. On boot / Settings mount, if the hash is `pl_gis`, strip it and run the existing `signInWithGoogleToken` / conflict / onboarding flow. If `pl_gis_error`, show the Cloud Sync error alert.
5. HOSTING: add the API callback URL to the OAuth client **Authorized redirect URIs**. Popup JS origins unchanged.

### Out of scope

- Changing desktop popup UX
- `use_fedcm_for_button` / One Tap `prompt()`
- GIS button size, theme, locale (217 / 182 / 215)
- Android native app (122)
- Publishing the OAuth app / Google verification
- Fake Google (`VITE_FAKE_GOOGLE`) click path

## Domain rules

- Redirect is for coarse mobile user-agents (`Android`, `iPhone`, `iPad`, `iPod`) or `navigator.userAgentData.mobile`, and for `display-mode: standalone`. Desktop Chrome/Firefox/Safari tabs stay popup.
- The API bounce must not create a session. Conflict detection still needs the client’s `localHasData`.
- Put the JWT in the **hash**, not a query string. `history.replaceState` (or equivalent) removes it before further navigation. Do not log the token.
- Redirect `initialize` sends a `nonce` stored in `sessionStorage`. Consuming `#pl_gis=` requires that nonce to match the JWT. A random hash does not sign the user in.
- Verify `g_csrf_token` body vs cookie when the cookie is present (same-site). Cross-origin bounce may omit the cookie; the JWT is still verified. Failed verify or CSRF mismatch → error hash, no JWT.
- Fake Google and Playwright stay on the shadcn button. No real GIS redirect in e2e.
- Operator still never sees passphrase, hex, or raw DEK.
- Silent stay-signed-out is still OK when the user cancels Google and no credential is issued.

## Acceptance scenarios

### Scenario: Desktop popup is unchanged

- **Given** a production-like web build on a desktop browser tab (not standalone)
- **When** Settings → Cloud Sync mounts GIS while signed out
- **Then** `initialize` uses `ux_mode: 'popup'` and a JS `callback`
- **And** it does not set `login_uri` for redirect
- **And** it does not call `prompt()`

### Scenario: Mobile and standalone use redirect

- **Given** official GIS on Android, iOS, or an installed PWA (`display-mode: standalone`)
- **When** Settings → Cloud Sync mounts GIS while signed out
- **Then** `initialize` uses `ux_mode: 'redirect'`
- **And** `login_uri` is `${apiBase}/v1/auth/gis-callback`
- **And** it still calls `renderButton` and does not call `prompt()`

### Scenario: Redirect credential completes the same session flow

- **Given** the app loads `/settings` with `#pl_gis=<jwt>`
- **When** the hash is consumed
- **Then** the client POSTs `/v1/auth/google` with that `idToken` (same as Spec 179)
- **And** the hash is removed
- **And** passphrase / hex onboarding and local-conflict still follow Spec 119

### Scenario: Redirect failure is visible

- **Given** the app loads `/settings` with `#pl_gis_error=1`
- **When** Cloud Sync renders
- **Then** the Cloud Sync error alert shows a message (not a hang, not silent signed-out)

### Scenario: Callback bounce does not create a session

- **Given** Google POSTs a valid `credential` to `/v1/auth/gis-callback`
- **When** the API handles it
- **Then** it does not set `pl_session`
- **And** the response is a 302 to the web Settings URL with `#pl_gis=` and the JWT
- **And** a later `GET /v1/me` without a cookie is still 401

### Scenario: Fake Google is unchanged

- **Given** `VITE_FAKE_GOOGLE=1` and Cloud Sync is configured
- **When** the user clicks `google-sign-in`
- **Then** the app uses the fake token path (no GIS redirect)
- **And** existing Playwright cloud-auth / sync-conflict flows still pass

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts` — `gisNeedsRedirectUx`, initialize popup vs redirect + `login_uri`, `consumeGisRedirectHash`
- Vitest: `apps/api/src/app.test.js` — GIS callback 302 with JWT hash, CSRF / invalid token → error hash, no session cookie
- Playwright: existing `e2e/cloud-auth.e2e.ts` and `e2e/sync-conflict.e2e.ts` (fake Google; no real GIS redirect e2e)
- Implementation: `google-signin.ts`, `MorePanel.svelte` / `App.svelte`, `apps/api/src/app.js`, `docs/HOSTING.md`

## Related

- 179 GIS popup (desktop stays)
- 119 Google session
- 178 production client id + cookie
