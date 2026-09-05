# Spec 211: Stale account unlock after the session is gone

- **ID:** 211
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When a tab still shows a signed-in gate (account Unlock, recovery, onboarding) but the Google session is already gone, leave cloud mode and continue as signed-out local. Never show API jargon such as `unauthorized`.

## Scope

### In scope

1. Account Unlock, recovery, and onboarding gates drop cloud when the session is gone
2. After drop: device Unlock if lock is on, otherwise the signed-out app
3. 401 / `unauthorized` is not shown as Unlock (or recovery) field copy and does not count as a wrong guess
4. Detect on wrap/unlock 401, when the tab becomes visible, and when another tab signs out (`localStorage` epoch)

### Out of scope

- GIS button chrome (210)
- Remapping every API error in Settings / sync
- Changing the API JSON `{ error: 'unauthorized' }`
- Keeping Dexie on the tab that confirmed sign-out (119)

## Domain rules

- `GET /v1/me` returning 401/`null` while this tab still has `signedIn` means the session is gone.
- Reload (full load of `/`) after drop so IndexedDB matches a sibling that wiped the database.
- Wrong passphrase with a live session is still **Incorrect passphrase**.
- Network errors that are not 401 do not drop the session.

## Acceptance scenarios

### Scenario: Cookie gone on account Unlock

- **Given** account Unlock after a completed cloud onboarding
- **When** the session cookie is gone and they submit a passphrase
- **Then** they leave account Unlock
- **And** they see **Unlock this device** (lock on) or the signed-out app (lock off)
- **And** the page does not show `unauthorized`

### Scenario: Wrong passphrase with a live session

- **Given** account Unlock and a valid session
- **When** they submit the wrong passphrase
- **Then** the field alert is **Incorrect passphrase**
- **And** they stay on account Unlock

### Scenario: Sibling tab signed out

- **Given** tab A is unlocked in the app and tab B is on account Unlock
- **When** tab A confirms sign-out
- **Then** tab B leaves account Unlock without a passphrase submit
- **And** tab B does not show `unauthorized`

### Scenario: Tab becomes visible

- **Given** this tab is on a signed-in gate and the session is already gone
- **When** the document becomes visible
- **Then** it drops cloud the same way as a 401 on Unlock
- **And** it does not count a lockout guess

## Traceability

- Vitest: `apps/web/src/lib/application/cloud-session.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: `apps/web/src/lib/application/cloud-session.ts`, `apps/web/src/App.svelte`
