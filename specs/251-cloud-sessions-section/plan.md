# Plan 251: Cloud Sync Sessions section

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 119, 154, 186

## What

Replace the raw user-agent session list inside Cloud Sync with a signed-in **Sessions** inner section (above Account): labeled devices, browser name + version, one last-access time, GeoIP area, last IP, This-device badge, separators, per-row revoke on other devices, and revoke-all. Account contains picture, name, email, Sign out, and WebAuthn.

## Why

Spec 119 shipped list + revoke, but Settings still shows opaque user-agent strings and only bumps `lastSeenAt` on `GET /v1/me`. A second browser looks like a mystery string. This is the session manager the product already promised.

## Out of this slice

- GPS / browser Geolocation
- Android native app (122)
- A new Settings card
- Wipe-account
