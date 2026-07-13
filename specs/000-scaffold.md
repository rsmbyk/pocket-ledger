# Spec 000: Scaffold

- **ID:** 000
- **Status:** Accepted

## Intent

Bootstrap an installable offline-capable shell with local storage, theming, and process docs — without finance features yet.

## Scope

### In scope

- Mobile-first app shell branding Pocket Ledger
- Default single account named `Main` (single-pot mode)
- Theme: system default; user can choose Light / Dark / System; preference persists
- PWA: web manifest, icons, service worker registration
- Dexie database opens successfully
- Layered architecture folders and docs/specs present

### Out of scope

- Creating transactions
- Charts, recurring, goals, net worth, export, encryption UI
- Router

## Domain rules

- Money helpers reject non-integer minor units
- Default account currency label is `IDR` (display only)

## Acceptance scenarios

### Scenario: Shell loads with default account

- **Given** a first-time visitor
- **When** they open the app
- **Then** they see “Pocket Ledger” and account heading “Main”

### Scenario: Dark theme can be selected

- **Given** the app shell is visible
- **When** the user opens the theme menu and chooses Dark
- **Then** the document root has the `dark` class

### Scenario: Service worker registers

- **Given** the production build preview
- **When** the app loads
- **Then** a service worker becomes ready

## Traceability

- Vitest: `src/lib/domain/money.test.ts`, `src/lib/shared/theme.test.ts`
- Playwright: `e2e/scaffold.e2e.ts`
- Implementation: `src/App.svelte`, `src/lib/ui/AppShell.svelte`, `src/lib/application/accounts.ts`, `src/lib/data/db.ts`, `vite.config.ts`
