# Spec 250: Remove temporary debug

- **ID:** 250
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Specs 180 and 181 were temporary. Production Cloud Run and Settings no longer expose testing-only cloud wipe or fake GIS. Local and e2e fake Google stay.

## Scope

### In scope

1. Signed-out Cloud Sync with official GIS (`VITE_FAKE_GOOGLE` off, client id set): no **Sign up with fake account**.
2. Signed-in Cloud Sync: no **Reset cloud and sign out** / **Reset cloud, stay signed in**.
3. Sign out of any account: logout + this-device wipe; **cloud rows stay**. No special `pl-debug-cursor` wipe.
4. `POST /v1/debug/reset-cloud` is gone (404). Drop store `deleteAccount` / `resetAccountKeepSession` (API user wipe, not Dexie pockets).
5. Drop `AUTH_FAKE_SUB` and the production debug identity. Cloud Run deploy does **not** set `AUTH_ALLOW_FAKE` or `AUTH_FAKE_SUB`, and **removes** both if they already exist.
6. Local/e2e: `AUTH_ALLOW_FAKE=1` still accepts `fake.<sub>.<email>` (including `fake.<uuid>.e2e@example.com`). `VITE_FAKE_GOOGLE=1` still shows the local Sign in with Google button.

### Out of scope

- Un-parking wipe-account in PRODUCT/ROADMAP
- Changing GIS popup / redirect
- Mass Prettier / adding lint to CI

## Domain rules

- Operator still never sees passphrase, hex, or raw DEK.
- Spec 178: production API never `AUTH_ALLOW_FAKE`.
- `--update-env-vars` does not drop keys; the API deploy must `--remove-env-vars=AUTH_ALLOW_FAKE,AUTH_FAKE_SUB`.

## Acceptance scenarios

### Scenario: No fake signup beside GIS

- **Given** production-like web (`VITE_GOOGLE_CLIENT_ID` set, fake Google off) and signed out
- **When** Settings → Cloud Sync renders
- **Then** GIS **Sign in with Google** is shown
- **And** **Sign up with fake account** (`debug-fake-signup`) is absent

### Scenario: No reset-cloud buttons

- **Given** a signed-in user
- **When** Settings → Cloud Sync renders
- **Then** **Reset cloud and sign out** and **Reset cloud, stay signed in** are absent

### Scenario: Sign-out keeps cloud

- **Given** a signed-in user with wrap and at least one entity
- **When** they confirm Sign out
- **Then** the API session is cleared and this device is wiped
- **And** that user’s cloud rows remain

### Scenario: Debug reset route is gone

- **Given** any client
- **When** `POST /v1/debug/reset-cloud`
- **Then** the API returns 404

### Scenario: Local e2e fake tokens still work

- **Given** `AUTH_ALLOW_FAKE=1` and `AUTH_FAKE_SUB` unset
- **When** e2e uses `fake.<uuid>.e2e@example.com`
- **Then** the API still issues a session

## Traceability

- Vitest: `apps/api/src/app.test.js`, `apps/api/src/verify-google.test.js`, `apps/web/src/lib/application/cloud-api.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `app.js`, `verify-google.js`, `index.js`, `memory-store.js`, `postgres-store.js`, `deploy-api.yml`, `cloud-api.ts`, `App.svelte`, `MorePanel.svelte`, `AppShell.svelte`, `AppShellChrome.svelte`

## Related

- 180, 181 (superseded)
- 119, 178
