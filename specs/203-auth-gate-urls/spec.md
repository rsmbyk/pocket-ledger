# Spec 203: Path URLs for lock, onboarding, recovery, reset

- **ID:** 203
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While a full-screen account or device gate is showing, the address bar uses a named path. App state stays the source of truth; the URL mirrors the gate.

## Scope

1. `/unlock` — device Unlock and account Unlock
2. `/onboarding` — first account passphrase (not pending reset)
3. `/onboarding/kit` — hex kit
4. `/recovery` — kit paste when wrap still exists
5. `/reset` — new passphrase after a successful kit (`pendingPassphraseReset`)

Replace-navigate to the canonical path. A gate path when that gate is not active goes to `/`. A shell path while a gate is showing goes to the gate. After unlock, `/` home (do not restore Settings).

Supersedes Spec 191 items 1–2 (URL `/` while unlocking) only. Unlock copy and Privacy field errors stay. Screensaver overlay and Settings Reset everything dialog unchanged.

## Acceptance scenarios

### Scenario: Header lock is `/unlock`

- **Given** device lock on `/settings`
- **When** they header-lock
- **Then** Unlock is shown at `/unlock`
- **When** they unlock
- **Then** home is shown at `/`

### Scenario: First passphrase is `/onboarding`

- **Given** a new Google account
- **When** the passphrase screen is shown
- **Then** the URL is `/onboarding`
- **When** they continue to the kit
- **Then** the URL is `/onboarding/kit`

### Scenario: Recovery and reset

- **Given** account Unlock after 3 wrongs and recovery is opened
- **Then** the URL is `/recovery`
- **When** the kit unwraps and the new-passphrase screen is shown
- **Then** the URL is `/reset`

## Traceability

- Playwright: `e2e/base-features.e2e.ts`, `e2e/cloud-auth.e2e.ts`
- Implementation: `App.svelte`, `apps/web/src/routes/unlock`, `onboarding`, `onboarding/kit`, `recovery`, `reset`
