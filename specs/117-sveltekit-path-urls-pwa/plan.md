# Plan 117: SvelteKit path URLs + PWA

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 009 (hash router); Spec 115 (docs target); Spec 118 (`apps/web` on Cloud Run)

## Why

Hash routes (`#/activity`) were a no-router compromise. Signed-in cloud and a “proper web app” need path URLs (`/activity`). Keep the service worker so signed-out still works offline after first load. `adapter-static` matches Cloud Run static hosting.

## Approach

Adopt SvelteKit with `adapter-static` and `fallback` for SPA. Replace `src/lib/shared/router.ts` hash sync with Kit path routes. Keep PWA/SW. Do not drop offline for signed-out. Workspaces move to `apps/web` may land here or with Spec 118 if that keeps the PR smaller — prefer `apps/web` in this slice if the Kit app is a new root.

## Scope / edges

**In:** path routing, Kit static adapter, PWA kept, hash bookmarks not preserved.

**Out:** Google Sign-In, wrapping, sync, Cloud Run Docker (118).
