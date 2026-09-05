# Tasks 204: Invalid URL falls back to nearest valid parent

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Red Vitest `apps/web/src/lib/shared/router.test.ts` — `nearestValidPath` + parsePath parents
- [x] Green `router.ts`; replace-navigate in `App.svelte` / `AppShell.svelte`
- [x] Playwright `e2e/router.e2e.ts`, `e2e/pocket-details.e2e.ts`
- [x] Commit linking Spec 204
