# Tasks 245: Shell loading skeletons

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Domain

- [x] Red Vitest `apps/web/src/lib/shared/shell-loading.test.ts` — spinner vs shell skeleton vs ready; `shellNeedsLedger` gates; pocket-details wait vs redirect
- [x] Green helpers in `apps/web/src/lib/shared/shell-loading.ts`

## UI

- [x] Red/green `apps/web/src/lib/ui/ShellStageSkeleton.svelte.test.ts` — testids, `aria-label="Loading"`, no ledger copy; Home has no Plans card; route variants
- [x] `ShellStageSkeleton.svelte` — home, transactions, plans, pockets, pocket details, categories, settings (xl approximations)
- [x] Red/green `apps/web/src/lib/ui/MonthSummary.svelte.test.ts` — `loading` pulses body, keeps chrome, disables arrows
- [x] `App.svelte` — session vs ledger ready; unlock keeps skeleton until refresh; month loading flag; 30s sync does not clear `ledgerReady`
- [x] `AppShell.svelte` / `AppShellChrome.svelte` — stage skeleton; no `/pockets` redirect while ledger loading; disable Add / Filters / hide-amounts while waiting
- [x] Remove dead AppShell `!ready` → `StartupLoading` branch
- [x] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files — skipped (MCP not available); `svelte-check` clean

## Playwright / docs

- [x] `e2e/scaffold.e2e.ts` — after boot, no `shell-stage-skeleton`; Home visible; no Starting up; Settings nav has no skeleton
- [x] `e2e/month-charts.e2e.ts` — prev month keeps `month-summary` mounted
- [x] `docs/PRODUCT.md` — shell loading skeletons
- [x] Spec 221 related-note: spinner is session-unknown only
- [x] `npm run check` (`svelte-check` + `tsc -p tsconfig.node.json`)
- [x] `npm run test:unit:run` (web)
- [x] `npx playwright test e2e/scaffold.e2e.ts e2e/month-charts.e2e.ts`
