# Tasks 114: Mobile checkbox scale

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Pocket opening checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/PocketsPanel.svelte` (`pocket-opening-enabled`)
- [x] Pocket goal checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/PocketsPanel.svelte` (`pocket-goal-enabled`)
- [x] Hide voided checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/AppShellChrome.svelte` (`activity-filter-hide-voided`)
- [x] Reset keep checkboxes: `size-5 accent-primary md:size-4` in `src/lib/ui/MorePanel.svelte` (`reset-preserve-categories`, `reset-preserve-passphrase`)
- [x] Leave goal-date trailing checkbox unchanged (Spec 113)
- [x] `npm run check` clean
- [x] Manual: narrow viewport — in-scope checkboxes read `size-5`; `md+` read `size-4`
- [x] Playwright: deferred (no dedicated e2e this slice)
- [x] Update `specs/README.md` status → Accepted when landing
- [x] Commit + draft PR linking Spec 114
