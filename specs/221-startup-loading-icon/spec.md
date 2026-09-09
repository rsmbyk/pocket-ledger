# Spec 221: Startup loading icon

- **ID:** 221
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While the ledger is still opening, show a loading icon only. Drop the “Starting up” / “Preparing your local ledger” copy.

## Scope

### In scope

1. App `!ready` gate is a centered spinner with no startup sentence.
2. AppShell `!ready` branch uses the same splash (no card title/description).
3. Assistive name is “Loading”.

### Out of scope

- Unlock, onboarding, recovery, screensaver
- Changing what `ready` means or how long bootstrap takes
- Error card when the database fails to open

## Domain rules

- None (display only)

## Acceptance scenarios

### Scenario: Splash is an icon

- **Given** the app has not finished opening the local ledger
- **When** the startup gate is shown
- **Then** a spinning loading icon is visible
- **And** the screen does not say “Starting up” or “Preparing your local ledger”

### Scenario: After boot the shell is normal

- **Given** a fresh signed-out ledger
- **When** startup finishes
- **Then** Home is shown
- **And** there is no leftover Starting up copy

## Traceability

- Vitest: `apps/web/src/lib/ui/StartupLoading.svelte.test.ts`
- Playwright: `e2e/scaffold.e2e.ts`
- Implementation: `StartupLoading.svelte`; `App.svelte`; `AppShell.svelte`

## Related

- 000 scaffold shell
- 245 shell loading skeletons — spinner is **session-unknown only**; AppShell `!ready` splash superseded
