# Spec 191: Unlock `/`, shorter copy, Privacy labels and field errors

- **ID:** 191
- **Status:** Accepted — gate URLs superseded by [203](../203-auth-gate-urls/spec.md)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While unlocking (account, device, or kit recovery), the address bar is `/`. After a successful unlock the shell opens on home. Account Unlock copy is one sentence. Signed-in Privacy change-passphrase uses Old / New titles and field-scoped errors with an X on the invalid input.

## Scope

### In scope

1. `goto('/', { replaceState: true })` when device Unlock, account Unlock, or AccountRecoveryScreen is shown and the path is not `/`.
2. After unlock, stay on `/` (home). Do not restore the previous route.
3. Account Unlock description: **Enter your account passphrase.**
4. Privacy change form: section headings **Old passphrase** and **New passphrase**.
5. **Incorrect passphrase** under the old field with X. **New passphrase must be different** live under the new field with the length list and X; submit stays off until new !== old.

### Out of scope

Screensaver, onboarding passphrase/kit, lockout rungs, restoring the pre-lock route, enable-lock / disable-lock forms.

## Acceptance scenarios

### Scenario: Lock from Settings goes to `/`

- **Given** signed-in complete account on `/settings`
- **When** they header-lock
- **Then** `account-unlock-screen` is shown and the URL is `/`
- **When** they unlock with the passphrase
- **Then** `home-panel` is shown at `/`

### Scenario: Device lock from a non-home route

- **Given** signed-out lock enabled on `/settings`
- **When** they header-lock or reload locked
- **Then** `unlock-screen` is at `/`
- **When** they unlock
- **Then** they see home, not Settings

### Scenario: Account Unlock copy

- **Given** account Unlock
- **When** the screen is shown
- **Then** the description is exactly `Enter your account passphrase.`

### Scenario: Privacy field titles and errors

- **Given** signed-in Privacy change form
- **Then** **Old passphrase** and **New passphrase** section titles are visible
- **When** current is wrong
- **Then** **Incorrect passphrase** is under the old field with an X, not a form footer
- **When** new equals old
- **Then** **New passphrase must be different** is under the new field with an X and submit is off

## Traceability

- Vitest: `apps/web/src/lib/application/new-passphrase-fields.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`, `e2e/base-features.e2e.ts`
- Implementation: App.svelte, UnlockScreen, MorePanel, NewPassphraseFields
