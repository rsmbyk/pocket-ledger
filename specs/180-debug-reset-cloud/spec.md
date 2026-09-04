# Spec 180: Debug reset cloud (temporary)

- **ID:** 180
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Temporary signed-in Settings controls so Ronald can re-test new-user signup/signin on Iowa. **Remove this spec’s implementation when testing is done.** Wipe-cloud / delete-account stays parked in PRODUCT.

## Scope

### In scope

1. Signed-in Cloud Sync: two destructive testing buttons, each with its own danger confirm.
2. **Reset cloud and sign out:** delete this `google_sub`’s `entities`, `sessions`, and `users` row; clear `pl_session`; wipe IndexedDB; reload `/` signed out.
3. **Reset cloud, stay signed in:** delete `entities`; null `wrap` / `recovery_wrap` and set `wrap_rev` to 0; delete other sessions; **keep** this session and `users` row; wipe IndexedDB; reload. `GET /v1/me` is `needs-passphrase`.
4. `POST /v1/debug/reset-cloud` with JSON `{ signOut: true | false }`. Session required. 401 if unsigned.
5. Both paths wipe this device’s Dexie (same as Sign out local wipe) so old ciphertext cannot fight a new wrap.

### Out of scope

- Un-parking wipe-account in PRODUCT/ROADMAP
- Revoking Google OAuth
- Wiping other users / `TRUNCATE`
- Keeping IndexedDB on either path

## Domain rules

- Testing-only copy on buttons and confirms. Permanently deletes **this** account’s cloud copy and wipes this device.
- Stay-signed-in cannot delete the `users` row (session FK).
- Fake Google / e2e use the same buttons.
- After sign-out reset, next GIS/`ensureUser` is `needs-passphrase` and `cloudHasData` false.

## Acceptance scenarios

### Scenario: Reset then sign out

- **Given** a signed-in user with wrap and at least one entity
- **When** they confirm **Reset cloud and sign out**
- **Then** that user’s cloud rows are gone
- **And** they see signed-out Settings (GIS or fake Sign in)
- **And** signing in again is `needs-passphrase`

### Scenario: Reset, stay signed in

- **Given** a signed-in user with wrap and entities
- **When** they confirm **Reset cloud, stay signed in**
- **Then** wrap and entities are cleared, this session remains
- **And** they see the account passphrase screen without clicking Sign in

### Scenario: Unsigned debug reset is rejected

- **Given** no session cookie
- **When** `POST /v1/debug/reset-cloud`
- **Then** the API returns 401

## Traceability

- Vitest: `apps/api/src/memory-store.test.js`, `apps/api/src/postgres-store.test.js`, `apps/api/src/app.test.js`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `memory-store.js`, `postgres-store.js`, `app.js`, `cloud-api.ts`, `MorePanel.svelte`, `App.svelte`

## Related

- 119 Google session
- 178 Cloud SQL
