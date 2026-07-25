# Tasks 100: DateField opens on mobile

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Red: Playwright `e2e/date-field.e2e.ts` — mobile viewport, open Add tx, activate `tx-occurred-on`, set/select a date, assert display updates
- [ ] Green: rework `src/lib/ui/DateField.svelte` so the native `type="date"` input is the hit target (opacity-0 overlay or equivalent — not `sr-only` + `showPicker`-only)
- [ ] Preserve formatted display, disabled state, `testid`, `aria-label`, trailing snippet hit area
- [ ] Soften/remove Spec 047 toggle-close expectation in docs if behavior changes; keep open reliable
- [ ] `npm run check` clean; Playwright date-field (and existing tx smoke) pass
- [ ] Update `specs/README.md` status → Accepted when landing
- [ ] Commit + draft PR linking Spec 100
