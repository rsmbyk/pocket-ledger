# Spec 181: Debug fake signup (temporary)

- **ID:** 181
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Temporary signed-out Settings control so production Cloud Run can be tested in Cursor’s browser without GIS. **Remove this spec’s implementation when testing is done** (same wave as spec 180). Wipe-account stays parked in PRODUCT.

## Scope

### In scope

1. Signed-out Cloud Sync when real GIS is shown (`VITE_FAKE_GOOGLE` off, client id set): testing button **Sign up with fake account** with a danger confirm.
2. Confirm wipes this device’s IndexedDB and DEK, then `POST /v1/auth/google` with the fixed token `fake.pl-debug-cursor.cursor-debug@pocket-ledger.test` and `localHasData: false`.
3. Sign-out when `user.googleSub === 'pl-debug-cursor'`: `POST /v1/debug/reset-cloud` `{ signOut: true }`, wipe IndexedDB, reload `/` (same as spec 180 reset-and-sign-out). Confirm copy says this debug user’s cloud copy is deleted.
4. Sign-out of any other user: unchanged (logout + local wipe; cloud stays).
5. API: `AUTH_ALLOW_FAKE=1` still required for `fake.*` tokens. When `AUTH_FAKE_SUB` is set, only that `sub` is accepted; other `fake.*` tokens fail.
6. Production Cloud Run (temporary): set `AUTH_ALLOW_FAKE=1` and `AUTH_FAKE_SUB=pl-debug-cursor`. Local/e2e omit `AUTH_FAKE_SUB`.
7. Local `VITE_FAKE_GOOGLE=1`: keep the existing random-uuid **Sign in with Google** button; do not add this debug button.

### Out of scope

- Un-parking wipe-account
- GIS `ux_mode: 'redirect'` or One Tap `prompt()`
- GIS button light/dark theme (spec 182)
- Wiping Ronald’s real Google `users` row

## Domain rules

- Testing-only copy. The debug user is a well-known public `sub` while this slice lives on Cloud Run.
- Random e2e tokens `fake.<uuid>.e2e@example.com` keep working when `AUTH_FAKE_SUB` is unset.
- Operator still never sees passphrase, hex, or raw DEK in logs.

## Acceptance scenarios

### Scenario: Fake signup beside GIS

- **Given** production-like web (`VITE_GOOGLE_CLIENT_ID` set, fake Google off) and signed out
- **When** Settings → Cloud Sync renders
- **Then** GIS **Sign in with Google** is shown
- **And** **Sign up with fake account** is shown (`debug-fake-signup`)

### Scenario: Fake signup is new-user onboarding

- **Given** signed out and the debug cloud user does not exist (or was wiped)
- **When** they confirm **Sign up with fake account**
- **Then** this device’s Dexie is empty and they POST the fixed fake token
- **And** they see the account passphrase screen (`needs-passphrase`)

### Scenario: Sign-out of the debug user wipes cloud

- **Given** signed in as `pl-debug-cursor` with wrap and at least one entity
- **When** they confirm Sign out
- **Then** that user’s cloud rows are gone (same as spec 180 sign-out reset)
- **And** they see signed-out Settings (GIS + fake signup)

### Scenario: Sign-out of a real Google user keeps cloud

- **Given** signed in as a non-debug `google_sub`
- **When** they confirm Sign out
- **Then** the API session is cleared and this device is wiped
- **And** that user’s cloud rows remain

### Scenario: Strict fake sub on production

- **Given** `AUTH_ALLOW_FAKE=1` and `AUTH_FAKE_SUB=pl-debug-cursor`
- **When** `POST /v1/auth/google` with `fake.other.a@b.com`
- **Then** the API returns 401
- **And** the fixed debug token succeeds

### Scenario: Local e2e fake tokens unrestricted

- **Given** `AUTH_ALLOW_FAKE=1` and `AUTH_FAKE_SUB` unset
- **When** e2e uses `fake.<uuid>.e2e@example.com`
- **Then** the API still issues a session

## Traceability

- Vitest: `apps/api/src/verify-google.test.js`, `apps/web/src/lib/application/cloud-api.test.ts`
- Playwright: existing `e2e/cloud-auth.e2e.ts` (fake Google path unchanged; no GIS)
- Implementation: `verify-google.js`, `index.js`, `deploy-api.yml`, `cloud-api.ts`, `MorePanel.svelte`, `App.svelte`, `docs/HOSTING.md`

## Related

- 119 Google session
- 178 Production Cloud SQL + Google (temporary AUTH_ALLOW_FAKE exception)
- 180 Debug reset cloud
