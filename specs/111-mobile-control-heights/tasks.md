# Tasks 111: Mobile control heights

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Button `default` / `icon` (and `lg` / `icon-lg` if needed): `h-11 md:h-9` / `size-11 md:size-9` in `src/lib/components/ui/button/button.svelte`
- [x] Input: `h-11 md:h-9` in `src/lib/components/ui/input/input.svelte`
- [x] InputGroup root: `h-11 md:h-9` in `src/lib/components/ui/input-group/input-group.svelte`
- [x] Tabs list horizontal: `h-11 md:h-9` in `src/lib/components/ui/tabs/tabs-list.svelte`
- [x] Align hardcoded `h-9` chrome: `CategoryPicker.svelte`, `DateField.svelte`, QuickAdd pocket/type triggers, AppShell filter chrome → `h-11 md:h-9`
- [x] Leave compact sizes (`xs`/`sm`/`icon-xs`/`icon-sm`) and sidebar nav heights unchanged
- [x] `npm run check` clean
- [x] Manual: narrow viewport (&lt; `md`) — default Button / Input / CategoryPicker ≈ 44px; `md+` ≈ 36px (class contract: `h-11 md:h-9`)
- [x] Playwright: deferred (no dedicated height e2e this slice)
- [x] Update `specs/README.md` status → Accepted when landing
- [x] Commit + draft PR linking Spec 111
