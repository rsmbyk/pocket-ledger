# Spec 117: SvelteKit path URLs + PWA

- **ID:** 117
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Replace the hash router with SvelteKit path URLs while keeping the PWA so signed-out users still work offline after first load.

## Scope

### In scope

1. SvelteKit + `@sveltejs/adapter-static` (SPA fallback)
2. Routes: `/`, `/activity`, `/pockets`, `/categories`, `/more` (same panels as today)
3. Remove hash-router as the navigation source (`src/lib/shared/router.ts` or equivalent)
4. Keep service worker / PWA; signed-out offline after first load still works
5. Unknown paths fall back to the shell (SPA) the same way unknown hashes fell back to home
6. Hash bookmarks (`#/activity`) are **not** preserved
7. Update Playwright base URLs / locators that assumed hashes
8. Optionally move the app to `apps/web` (npm workspace) if that is the cleanest Kit layout; otherwise Spec 118 must move it before Cloud Run Docker

### Out of scope

- Google Sign-In, account passphrase, sync (119–121)
- Cloud Run / retire Cloudflare (118)
- Changing money rules or panel contents

## Domain rules

- Signed-out: SW may cache the shell; it is not a substitute for signed-in sync.
- Deep links are path-based (`/activity`), not hash-based.

## Acceptance scenarios

### Scenario: Activity is a path

- **Given** the built app after this slice
- **When** the user opens `/activity` (or clicks Activity in the shell)
- **Then** the Activity panel is shown
- **And** the address bar path is `/activity` (no required `#/activity`)

### Scenario: Signed-out offline after first load

- **Given** a user has loaded the app once while online (SW installed)
- **When** the network is offline and they reopen the origin
- **Then** the signed-out shell still loads from cache
- **And** IndexedDB ledger still works

### Scenario: Unknown path

- **Given** a visit to `/not-a-panel`
- **When** the SPA fallback runs
- **Then** the user gets the home shell (same idea as unknown hash → home), not a raw 404 document without the app

### Scenario: Old hash URL is not a supported bookmark

- **Given** a saved link `#/activity`
- **When** the user opens it after this slice
- **Then** we do not guarantee Activity (hash bookmarks dropped)

## Traceability

- Vitest: router helpers if any remain (`src/lib/shared/router.ts` removal or Kit load tests)
- Playwright: `e2e/` navigation — update from hashes to paths (`e2e/*.e2e.ts`)
- Implementation: SvelteKit config, routes, PWA plugin/SW, `docs` if 115 already stated the target

## Related

- 009 hash router (supersede as navigation)
- 118 Cloud Run
