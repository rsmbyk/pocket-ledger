# Spec 119: Google Sign-In, account passphrase, hex kit, session manager

- **ID:** 119
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Let a user opt into cloud with Google only, force a finished account-passphrase + hex-kit onboarding, resume if they cut off, and manage sessions — without email/password and without operator-held DEK (wrapping in Spec 120).

## Scope

### In scope

1. Google Sign-In only; no email/password
2. Never force Google on signed-out users
3. Device passphrase (if on) must unlock **before** Google
4. Distinct account-lock UI vs device lock
5. New account: set passphrase (≥ 8) then hex kit (copy **or** download + checkbox); money UI blocked until both done
6. Existing account: enter passphrase **or** hex then set new passphrase; no typed-guess limit
7. Resume incomplete onboarding (see domain rules)
8. Account passphrase replaces device passphrase on this device (notify); cannot remove while signed in; change only
9. Optional WebAuthn third box **this device only** after account passphrase exists
10. Sign-in vs local data (has-data = non-virgin, including settings-only); never overwrite existing cloud history; warn + consent if local would be discarded
11. Sign-out / start-fresh: wipe all local app data; cloud untouched; warn no signed-in export
12. Session cookie 7-day rolling, HttpOnly Secure, API host; CORS
13. Session manager: list + revoke
14. Hide file export/import while signed in (or keep hidden until 120)
15. Device-lock skippable warning (exact copy in domain rules) — distinct from account lock
16. Device typed-passphrase wrong-guess ladder (not WebAuthn, not account passphrase)
17. Optional WebAuthn third box: this device only; cold visit and idle prefer WebAuthn (`userVerification: required`) then passphrase
18. Screensaver / idle overlay always: drop DEK; copy `Click to continue` vs `Click to unlock`; idle 5/10/15/30 min (default 30); leave-tab default on
19. Hex kit: 32 random bytes, grouped hex, case-insensitive; copy **or** download + checkbox

### Out of scope

- Sync protocol (121)
- Local DEK wrapping implementation details (120) except calling into that API when Accepted
- Cloud lockout + email
- Wipe-cloud / delete-account
- Password-manager auto-save

## Domain rules

- Passphrase and hex never sent to Hono. Server stores wrap envelopes only (120).
- Recovery wrap uploaded **only after** kit checkbox.
- If they leave after passphrase wrap, before kit: resume kit; mint **new** hex if the old one is gone from the client.
- Google done, no passphrase wrap: resume set-passphrase.
- Returning incomplete unlock: resume unlock, not ledger.
- **Has data:** not a virgin default Main + default settings.
- Cloud empty + local has data → upload local once wrapping exists (120/121).
- Cloud has data + local has data → warn, backup suggestion, consent, wipe local, pull cloud.
- No money UI (Activity / Pockets / More) until onboarding complete.
- Device skip warning (not a blocking modal): heading `This device is not encrypted`; body `Without a passphrase, anyone who can use this browser can read your ledger if the device is lost or left unlocked. Set a passphrase to encrypt it on this device.`; toggle `No passphrase: data on this device can be read if access is lost or shared.`; button `Set a passphrase`.
- Device lockout (typed passphrase only): every 3 consecutive wrongs; rungs 15m → 30m → 1h → 3h → 6h → 12h → 1 day max; at max wait until next local midnight; cool-down drop one rung on a calendar day with ≥1 success and 0 wrongs; counter is plaintext settings (honest).
- Screensaver: black overlay, slight transparency, icon + short text. Signed out no passphrase: `Click to continue`. Signed out passphrase on, or signed in: `Click to unlock`.

## Acceptance scenarios

### Scenario: Local-only user is not forced to Google

- **Given** a signed-out user
- **When** they use the ledger
- **Then** they never have to sign in with Google to record money

### Scenario: New account cannot skip kit

- **Given** Google Sign-In succeeded for a new cloud user
- **When** they have set a passphrase but not confirmed the hex kit
- **Then** they cannot open Activity / Pockets / More
- **And** a reload returns them to the kit step

### Scenario: Cut off before passphrase

- **Given** Google Sign-In succeeded and no passphrase wrap exists on the server
- **When** they return later with a valid session
- **Then** they see set-passphrase, not the ledger

### Scenario: Existing cloud + dirty local

- **Given** this device is not virgin and the Google account already has a ledger
- **When** they sign in
- **Then** they get a blocking warning that local data will be discarded
- **And** Cancel leaves them signed out (so they can export)
- **And** Consent wipes local and continues cloud unlock

### Scenario: Sign-out wipes the device

- **Given** a signed-in session
- **When** they confirm sign-out
- **Then** IndexedDB and session leftovers are gone
- **And** the app is a fresh signed-out install
- **And** cloud data on the server remains

### Scenario: Session revoke

- **Given** two sessions for the same Google user
- **When** they revoke the other session
- **Then** that session cookie is no longer valid

### Scenario: Distinct lock UIs

- **Given** device lock and account lock screens
- **When** the user compares copy/chrome
- **Then** they cannot be mistaken for one generic passphrase screen

### Scenario: Device skip warning copy

- **Given** a signed-out user with no device passphrase
- **When** they skip setting one
- **Then** they see the heading `This device is not encrypted` and the agreed body, toggle, and `Set a passphrase` button
- **And** it is not a blocking modal that traps them

### Scenario: Idle drops the DEK

- **Given** the user is unlocked (signed out or signed in)
- **When** the idle timer fires or they leave the tab (if that setting is on)
- **Then** the screensaver overlay appears and the DEK is gone from RAM
- **And** signed-out without a passphrase shows `Click to continue`
- **And** signed-out with a passphrase, or signed in, shows `Click to unlock`

### Scenario: Hex kit is copy or download

- **Given** a new account that has just set a passphrase
- **When** they are on the hex kit step
- **Then** they can copy **or** download the grouped hex
- **And** they must check that they stored it before continuing
- **And** the recovery wrap is not on the server until that confirm

## Traceability

- Vitest: `apps/api` session/onboarding state; `src/lib/application` or `apps/web` lock gates (paths TBD when workspaces land)
- Playwright: onboarding resume, skip-blocked, sign-out wipe (fakes/stubs for Google in e2e)
- Implementation: GIS, Hono session, More sign-in, onboarding screens, session manager

## Related

- 007 / 011 device lock (keep distinct)
- 120 wrapping
- 121 sync after session + DEK in RAM
