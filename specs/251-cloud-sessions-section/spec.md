# Spec 251: Cloud Sync Sessions section

- **ID:** 251
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Signed-in Cloud Sync shows a proper Sessions list (devices, browser, last access, area, IP, revoke) above Account. Account holds the Google profile plus Sign out and WebAuthn.

## Scope

### In scope

1. **Placement** — Cloud Sync inner order is **Sessions then Account**. Sessions is **signed-in only** (no heading, no empty state, no `/v1/sessions` fetch when signed out). Not a new Settings card.
2. **Row** — Access line `Browser · Chrome 128 · Windows 11` (client · browser name + major version · device). Native later: `Android · Infinix Hot 40` with no browser segment. **Android** means the native app only (122); Chrome/Safari/PWA on a phone is still `Browser`. One **Last access** time (`DD MMM YYYY HH:mm` local). GeoIP **area**. **Last IP**. Current row: **This device** shadcn Badge (`secondary`, `session-this-device`) beside the access line. Other rows have no badge. **Revoke** only on other devices.
3. **Separators** — shadcn Separator between rows, not after the last.
4. **Order** — Current session **always first**, even if another device was active more recently. Remaining rows by `lastSeenAt` descending. API list and UI both follow this.
5. **Last access** — Single `lastSeenAt`. Bump on any authenticated GET/PUT/DELETE that uses the session (`/v1/me`, `/v1/sync`, `/v1/wrap`, `/v1/sessions`, PUT wrap/sync, DELETE session as the caller, POST revoke-all as the caller). Still roll the 7-day cookie. No separate read/write times.
6. **Device labels** — Client from `X-PL-Client` (`browser` \| `android`); this web client always sends `browser`. Do not infer `android` from User-Agent `Android`. Browser label from `X-PL-Browser` or UA-CH `fullVersionList` / User-Agent (Chrome, Firefox, Safari, Edge + major version; not `Mozilla/5.0`). Device from `X-PL-Device` or UA-CH / User-Agent. iPhone model and Linux distro are often missing → `iPhone` / `Linux`.
7. **Area + IP** — From `X-Forwarded-For` leftmost, else `X-Real-IP`. Store and return both `lastArea` and `lastIp`. Finest of city, then region, then country. Private/loopback → area `Local network` and still show the IP. Lookup miss → `Unknown area`. Missing IP → `Unknown`. Local MMDB lookup; injectable for tests; no third-party HTTP GeoIP. List is only for the signed-in Google user.
8. **Revoke** — Other devices only, ConfirmDialog. Cookie dies; list refreshes. This device has no Revoke (Account Sign out).
9. **Revoke all** — Destructive **Revoke all sessions** (`session-revoke-all`) when more than one session. Danger confirm: other devices signed out and must use Google again; cloud stays; this device stays unless they opt in. Checkbox **Also revoke this device** (`session-revoke-all-include-current`), unchecked. Helper **You will be signed out of this device.** (`session-revoke-all-include-current-hint`). Unchecked + confirm → delete others. Checked + confirm → delete all, clear cookie, Sign-out wipe. Hidden when only one session.
10. **Account** — Inside Cloud Sync, **contains** picture + display name (186 helpers, initials fallback, `referrerpolicy="no-referrer"`), muted email, **Sign out**, **WebAuthn**. Sign-out wipe + confirm copy stay 119.
11. **Public list JSON** — `id`, `current`, `client`, `browserLabel`, `deviceLabel`, `lastSeenAt`, `lastArea`, `lastIp`. Drop `userAgent` from the public payload (keep internally).

### Out of scope

- GPS / browser Geolocation permission
- Android second repo (122)
- New Settings card
- Wipe-account

## Domain rules

- `client` is `android` only when `X-PL-Client` is `android` (native). Otherwise `browser`. A User-Agent containing `Android` is still `browser`.
- Access line joins non-empty segments with ` · `: client word (`Browser` / `Android`), optional browser label, optional device label.
- Headers `X-PL-Client`, `X-PL-Browser`, `X-PL-Device` win when present and valid; otherwise parse `User-Agent`. CORS allows those headers.
- Server stores `client`, `browser_label`, `device_label`, `last_area`, `last_ip` plus existing session columns. `last_seen_at` is the only access clock.
- Sort: current id first, then `lastSeenAt` desc, then `id` for stability.
- Operator still never stores passphrase, hex kit, or raw DEK. Area and last IP are session metadata, not ledger ciphertext. PRODUCT records that the account owner can see last IP per session.

## Acceptance scenarios

### Scenario: Sessions sits above Account when signed in

- **Given** a signed-in complete session
- **When** Settings → Cloud Sync
- **Then** an inner **Sessions** heading is present (`settings-section-sessions`)
- **And** it appears before the Account heading
- **And** the current device is the first row with `session-this-device` Badge **This device**
- **And** that row shows access + browser + device, one last-access time, an area, and a last IP
- **And** that row has no Revoke
- **And** **Revoke all sessions** is absent (only one session)
- **And** Account shows picture or initials, display name, email, Sign out, and WebAuthn when enrolled controls apply

### Scenario: Signed out hides Sessions

- **Given** a signed-out user
- **When** Settings → Cloud Sync
- **Then** `settings-section-sessions` is absent
- **And** Account (GIS / fake Google) is shown

### Scenario: Phone browser is Browser not Android

- **Given** a Chrome User-Agent on Android or Safari on iPhone
- **When** the session is labeled
- **Then** `client` is `browser`
- **And** the access line starts with `Browser`

### Scenario: Current session stays first

- **Given** two sessions for the same Google user
- **And** the other session has a newer `lastSeenAt`
- **When** `GET /v1/sessions` runs as the older current cookie
- **Then** the first listed session has `current: true`
- **And** remaining rows are `lastSeenAt` descending

### Scenario: Last access advances on sync

- **Given** a signed-in session whose `lastSeenAt` was set at login
- **When** that cookie `PUT`s `/v1/sync/:kind/:id` or `GET`s `/v1/sync`
- **Then** `lastSeenAt` on that session is later than login

### Scenario: GeoIP area, last IP, and private IP

- **Given** an authenticated request whose client IP is a public address the lookup maps to a city
- **When** sessions are listed
- **Then** `lastArea` is that city (with region/country if present)
- **And** `lastIp` is that address
- **Given** the client IP is loopback or RFC1918
- **Then** `lastArea` is `Local network`
- **And** `lastIp` is that private address

### Scenario: Revoke other device

- **Given** two sessions for the same Google user
- **When** they confirm Revoke on the other row
- **Then** that session cookie is no longer valid
- **And** this device stays signed in

### Scenario: Revoke all others

- **Given** two sessions for the same Google user
- **When** they confirm **Revoke all sessions** with **Also revoke this device** unchecked
- **Then** the other session cookie is no longer valid
- **And** this device stays signed in
- **And** the list is this device only

### Scenario: Revoke all including this device

- **Given** two sessions for the same Google user
- **When** they check **Also revoke this device** and confirm
- **Then** every session cookie for that user is no longer valid
- **And** this device is wiped (same as Sign out)
- **And** cloud data on the server remains

## Traceability

- Vitest: `apps/api/src/session-meta.test.js`; `apps/api/src/app.test.js`; `apps/api/src/memory-store.test.js`; `apps/api/src/postgres-store.test.js`; `apps/web/src/lib/application/session-device.test.ts`; `apps/web/src/lib/domain/session-access-display.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `apps/api` session store/schema/app; `apps/web` `cloud-api.ts`, `MorePanel.svelte`, Badge primitive; `openapi.yaml`; `docs/PRODUCT.md`

## Related

- 119 session manager; 154 Cloud Sync hub; 015 destructive confirms; 165 keep-option helpers; 186 sidebar profile; 122 Android parked
