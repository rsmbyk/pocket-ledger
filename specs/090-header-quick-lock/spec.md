# Spec 090: Header quick-lock

- **ID:** 090
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When passphrase lock is enabled, the sticky header shows a quick **Lock** control that locks the app immediately (same gated state as cold start).

## Scope

### In scope

1. Header icon button `data-testid="header-lock"`, all routes, only when `lockEnabled`
2. Placement: left of ThemeMenu (after Home eye toggle when on Home); ghost `icon-sm`
3. Click → clear in-memory data key + `unlocked = false` (no confirm) → UnlockScreen
4. `lockSession()` in `lock.ts` that only clears the session key (does not disable lock settings)
5. Thread `onLockSession` App → AppShell → AppShellChrome

### Out of scope

- Auto-lock timer / blur lock
- Confirm before lock
- Button when lock is off

## Acceptance scenarios

### Scenario: Lock mid-session

- **Given** lock enabled and app unlocked
- **When** the user taps header-lock
- **Then** unlock-screen is shown
- **When** they unlock with the passphrase
- **Then** the shell returns

## Traceability

- Playwright: base-features / new lock smoke
- Implementation: `lock.ts`, `App.svelte`, shell chrome

## Related

- UnlockScreen, More privacy
