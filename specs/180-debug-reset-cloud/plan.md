# Plan 180: Debug reset cloud (temporary)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119, 178. Remove after Ronald’s Iowa signup/signin testing.

## Why

Iowa Cloud SQL keeps `google_sub` after Sign out, so the same Gmail is a returning user. Need in-app testing controls to wipe this account’s cloud copy. Not product — PRODUCT wipe-account stays parked. Delete this slice when testing is done.

## Approach

Two signed-in Cloud Sync buttons. Both wipe IndexedDB. **Reset cloud and sign out** deletes user + sessions + entities and the cookie (GIS again). **Reset cloud, stay signed in** clears wrap/entities, keeps this session (passphrase screen, no GIS). `POST /v1/debug/reset-cloud` with `{ signOut }`.

## Scope / edges

**In:** Store methods, debug route, Settings confirms, Playwright, spec marked temporary.

**Out:** PRODUCT/ROADMAP un-park, Google account revocation, wipe other users, staying after this testing wave.
