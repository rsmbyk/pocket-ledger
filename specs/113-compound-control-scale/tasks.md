# Tasks 113: Compound control scale after mobile heights

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] InputGroup inline addon: `self-stretch` (drop `h-auto` + `py-1.5` for inline aligns) in `src/lib/components/ui/input-group/input-group-addon.svelte`
- [x] InputGroup root: `overflow-hidden` in `src/lib/components/ui/input-group/input-group.svelte`
- [x] Goal-date trailing checkbox: `size-5 md:size-4` in `src/lib/ui/PocketsPanel.svelte`
- [x] Leave Amount call-site prefix classes and DateField overlay gutter unchanged
- [x] `npm run check` clean
- [x] Manual: narrow viewport — Amount currency prefix fills `h-11`; goal-date checkbox reads `size-5`; `md+` prefix fills `h-9`, checkbox `size-4`
- [x] Playwright: deferred (no dedicated e2e this slice)
- [x] Update `specs/README.md` status → Accepted when landing
- [x] Commit + draft PR linking Spec 113
