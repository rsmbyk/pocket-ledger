# Tasks 254: Unlock screen focuses passphrase field + Enter unlocks

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Draft Accepted (STOP before checklist below)
- [x] Red — `apps/web/src/lib/ui/UnlockScreen.svelte.test.ts`: focus on mount; Enter submits DOM value when bound state is empty; empty submit is a no-op; no double submit while busy
- [x] Red — `e2e/unlock-enter.e2e.ts`: enable lock → reload → passphrase input focused → type + Enter → app shell (no click on field/button)
- [x] Green — `UnlockScreen.svelte`: focus via `$lib/ui/focus-first-text-field` on form visibility; submit reads input DOM value; button `disabled={busy}`; `submitPass` guards busy/locked/empty
- [x] Green — `App.svelte` `syncGatePath`: gate-path `goto(..., { keepFocus: true })` so the router does not blur the focused field (found via e2e: router blur raced the focus effect)
- [x] Existing suites: `npm run check` clean; `npm run test:unit:run` green; `npm run test:e2e` → 216 passed incl. the 3 new unlock tests — 4 failures (`router.e2e` ×3, `pocket-details.e2e` ×1) reproduce on baseline `develop` (pre-existing, unrelated); 1 `plans.e2e` dirty-overlay flake passed on rerun
- [ ] Board + `ITEM-002` moved in this PR (`Speccing` → `Ready` → `In progress` → `In review` → `Done`)
- [ ] Draft PR into `develop` linking Spec 254
