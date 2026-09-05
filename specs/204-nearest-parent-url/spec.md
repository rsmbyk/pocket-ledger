# Spec 204: Invalid URL falls back to nearest valid parent

- **ID:** 204
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

An invalid path replace-navigates to the nearest valid parent. The shell shows that parent, not Home, unless the parent is `/`.

## Scope

Path walking in `router.ts`, replace-navigate in App / AppShell. Canonical set: `/`, `/transactions`, `/pockets`, `/categories`, `/settings`, `/pockets/:id` (existence still checked in the shell), gate paths from 203 (`/unlock`, `/onboarding`, `/onboarding/kit`, `/recovery`, `/reset`). Aliases: `/activity` → `/transactions`, `/more` → `/settings`, `/home` → `/`.

Supersedes Spec 117 unknown-path (URL stays junk / always Home) and Spec 148 extra-segment → Home. Unknown pocket **id** still replace-navigates to `/pockets`.

## Acceptance scenarios

### Scenario: Unknown panel becomes home URL

- **Given** an unlocked ledger
- **When** the user visits `/not-a-panel`
- **Then** home is shown
- **And** the URL is `/`

### Scenario: Extra segment under a panel

- **Given** an unlocked ledger
- **When** the user visits `/transactions/nope`
- **Then** Transactions is shown at `/transactions`

### Scenario: Extra segment under a real pocket

- **Given** a pocket at `/pockets/{id}`
- **When** the user visits `/pockets/{id}/extra`
- **Then** details stay at `/pockets/{id}`

### Scenario: Extra segment under a bogus pocket id

- **Given** an unlocked ledger
- **When** the user visits `/pockets/bogus/extra`
- **Then** the Pockets list is shown at `/pockets`

### Scenario: Extra segment under a gate

- **Given** the kit gate is not active
- **When** the user visits `/onboarding/kit/x`
- **Then** the nearest parent is `/onboarding/kit`
- **And** Spec 203 still replace-navigates to `/`

## Traceability

- Vitest: `apps/web/src/lib/shared/router.test.ts`
- Playwright: `e2e/router.e2e.ts`, `e2e/pocket-details.e2e.ts`
- Implementation: `apps/web/src/lib/shared/router.ts`, `App.svelte`, `AppShell.svelte`
