# Tasks 114: Mobile checkbox scale

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Pocket opening checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/PocketsPanel.svelte` (`pocket-opening-enabled`)
- [ ] Pocket goal checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/PocketsPanel.svelte` (`pocket-goal-enabled`)
- [ ] Hide voided checkbox: `size-5 accent-primary md:size-4` in `src/lib/ui/AppShellChrome.svelte` (`activity-filter-hide-voided`)
- [ ] Reset keep checkboxes: `size-5 accent-primary md:size-4` in `src/lib/ui/MorePanel.svelte` (`reset-preserve-categories`, `reset-preserve-passphrase`)
- [ ] Leave goal-date trailing checkbox unchanged (Spec 113)
- [ ] `npm run check` clean
- [ ] Manual: narrow viewport — in-scope checkboxes read `size-5`; `md+` read `size-4`
- [ ] Playwright: deferred (no dedicated e2e this slice)
- [ ] Update `specs/README.md` status → Accepted when landing
- [ ] Commit + draft PR linking Spec 114
