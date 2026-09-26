# Spec 254: Unlock screen focuses passphrase field + Enter unlocks

- **ID:** 254
- **Status:** Accepted (2026-09-27)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Loading the unlock screen should let the user type (or accept an autofilled passphrase) and press **Enter** to unlock, without clicking the field or the button first.

## Scope

### In scope

1. `apps/web/src/lib/ui/UnlockScreen.svelte`:
   - Focus the passphrase input when the screen becomes visible (mount, and after a lockout expires and the form returns) using the existing `$lib/ui/focus-first-text-field` helper.
   - On submit, read the passphrase from the form input's DOM value (not from bound state), so autofill that fires no `input` event still unlocks.
   - Unlock button: `disabled={busy}` only; guard empty / busy / locked as a no-op inside `submitPass`.
2. Component test (browser Vitest) + Playwright E2E for the acceptance scenarios below.

### Out of scope

- Other gate screens (`AccountRecoveryScreen`, `AccountPassphraseScreen`, `HexKitScreen`) — separate ITEMs if wanted.
- A global `keydown` Enter handler (fixing focus is sufficient).
- Lockout rules, `onUnlock` contract, recovery flow, new dependencies.

## Domain rules

- No new domain rules; existing lockout / unlock rules unchanged. The change is UI-only: _how_ the passphrase reaches `onUnlock`, not _what_ happens with it.

## Acceptance scenarios

### Scenario: Field is focused on load

- **Given** the lock is enabled and the app loads at the unlock screen (or the header lock was pressed)
- **When** the unlock screen renders
- **Then** the passphrase input has DOM focus without any click

### Scenario: Enter unlocks

- **Given** the focused passphrase input contains the correct passphrase (typed or password-manager autofilled)
- **When** the user presses Enter
- **Then** the form submits once and the app shell appears — no click on the Unlock button

### Scenario: Autofill without input event still unlocks

- **Given** a password manager sets the input's value without firing an `input` event (bound state would be empty)
- **When** the user presses Enter
- **Then** submit reads the input's DOM value and unlocks with it (the button is not disabled for an empty bound state)

### Scenario: Empty submit is a no-op

- **Given** the passphrase input is empty
- **When** the user presses Enter
- **Then** nothing is sent to `onUnlock` and no error appears

### Scenario: No double submit while checking

- **Given** an unlock attempt is in flight
- **When** Enter is pressed again
- **Then** the button is disabled and no second `onUnlock` call happens

### Scenario: Lockout unchanged, focus returns after expiry

- **Given** a lockout is active
- **When** it expires and the form renders again
- **Then** the passphrase input is focused again and lockout behavior is otherwise unchanged

## Traceability

- Vitest: `apps/web/src/lib/ui/UnlockScreen.svelte.test.ts`
- Playwright: `e2e/unlock-enter.e2e.ts`
- Implementation: `apps/web/src/lib/ui/UnlockScreen.svelte`
