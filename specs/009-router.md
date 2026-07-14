# Spec 009: Hash router

- **ID:** 009
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Give each primary shell panel a stable URL so refresh, back/forward, and Playwright can deep-link without a heavy router library.

## Scope

### In scope

- Hash routes for existing panels: `#/` (home), `#/activity`, `#/more`
- Bottom/tab navigation updates the hash
- Hash changes (including browser back) update the visible panel
- Unknown hashes fall back to home
- No new npm router dependency (small shared helper)

### Out of scope

- Path-based history routing (`/activity`)
- Nested routes / params (month keys, transaction ids)
- Categories route (lands with spec 010)

## Domain rules

- Route ids: `home` | `activity` | `more`
- Empty hash, `#`, and `#/` map to `home`
- Parsing is case-sensitive path after `#/`

## Acceptance scenarios

### Scenario: Tab selection updates the URL hash

- **Given** the shell is on Home
- **When** the user opens the Activity tab
- **Then** the location hash is `#/activity` and the activity panel is shown

### Scenario: Hash deep-link opens the panel

- **Given** a ready ledger
- **When** the app loads with `#/more`
- **Then** the More panel is visible

### Scenario: Unknown hash falls back to home

- **Given** the hash `#/not-a-route`
- **When** the route is resolved
- **Then** the active route is `home`

## Traceability

- Vitest: `src/lib/shared/router.test.ts`
- Playwright: `e2e/router.e2e.ts`
- Implementation: `src/lib/shared/router.ts`, `AppShell.svelte`
