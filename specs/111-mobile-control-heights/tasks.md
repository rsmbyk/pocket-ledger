# Tasks 111: Mobile control heights

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Button `default` / `icon` (and `lg` / `icon-lg` if needed): `h-11 md:h-9` / `size-11 md:size-9` in `src/lib/components/ui/button/button.svelte`
- [ ] Input: `h-11 md:h-9` in `src/lib/components/ui/input/input.svelte`
- [ ] InputGroup root: `h-11 md:h-9` in `src/lib/components/ui/input-group/input-group.svelte`
- [ ] Tabs list horizontal: `h-11 md:h-9` in `src/lib/components/ui/tabs/tabs-list.svelte`
- [ ] Align hardcoded `h-9` chrome: `CategoryPicker.svelte`, `DateField.svelte`, QuickAdd pocket/type triggers, AppShell filter chrome → `h-11 md:h-9`
- [ ] Leave compact sizes (`xs`/`sm`/`icon-xs`/`icon-sm`) and sidebar nav heights unchanged
- [ ] `npm run check` clean
- [ ] Manual: narrow viewport (&lt; `md`) — default Button / Input / CategoryPicker ≈ 44px; `md+` ≈ 36px
- [ ] Playwright: deferred (no dedicated height e2e this slice)
- [ ] Update `specs/README.md` status → Accepted when landing
- [ ] Commit + draft PR linking Spec 111
