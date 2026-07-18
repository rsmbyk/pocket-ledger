# Spec 089: Show amounts passphrase

- **ID:** 089
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When Home amounts are hidden and passphrase lock is on, **Show money** requires a correct passphrase before revealing. Hiding stays one-tap. No lock → toggle as today.

## Scope

### In scope

1. Click Show money (`toggle-home-amounts`) while hidden + `lockEnabled` → passphrase dialog (do not flip yet)
2. Submit → `verifyPassphrase`; success → reveal + persist; failure → error, stay hidden
3. Cancel / dismiss → stay hidden
4. Hide money → no prompt
5. Lock off → immediate toggle both ways
6. Compact Dialog in AppShellChrome (not full UnlockScreen)

### Out of scope

- Clearing session key on hide
- Passphrase on other routes
- Biometrics

## Acceptance scenarios

### Scenario: Wrong then right

- **Given** lock enabled, amounts hidden
- **When** the user taps Show money and enters a wrong passphrase
- **Then** amounts stay masked
- **When** they enter the correct passphrase
- **Then** amounts are visible

### Scenario: No lock

- **Given** lock off, amounts hidden
- **When** the user taps Show money
- **Then** amounts reveal with no dialog

## Traceability

- Playwright: `e2e/home-amounts.e2e.ts`
- Implementation: `AppShellChrome.svelte`, `verifyPassphrase`

## Related

- 048, lock / privacy
