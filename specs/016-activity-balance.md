# Spec 016: Remove Activity balance

- **ID:** 016
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Keep a single balance surface on Home; Activity is the ledger list only.

## Scope

### In scope

- Remove the compact balance strip (`balance-compact`) from the Activity route
- Balance remains on Home (`balance-hero` / `account-balance`)

### Out of scope

- Changing Home balance presentation
- Activity filters (spec 017)
- Void / destructive behavior

## Domain rules

- None (chrome-only)

## Acceptance scenarios

### Scenario: Activity has no balance strip

- **Given** the user is on Activity
- **When** the stage renders
- **Then** there is no `balance-compact` (or other Activity balance summary)
- **And** the activity list (or empty state) is shown

### Scenario: Home still shows balance

- **Given** the user is on Home
- **When** the stage renders
- **Then** the account balance is visible in the balance hero

## Traceability

- Playwright: `e2e/desktop-layout.e2e.ts`, `e2e/polish.e2e.ts`, `e2e/transactions.e2e.ts` (assert balance on Home, not Activity)
- Implementation: `AppShellChrome.svelte`
- Related: `specs/013-desktop-layout.md` Activity section
