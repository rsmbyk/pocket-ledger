# Tasks 100: DateField opens on mobile

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Red: Playwright `e2e/date-field.e2e.ts` — mobile viewport, open Add tx, activate `tx-occurred-on`, set/select a date, assert display updates
- [x] Green: rework `src/lib/ui/DateField.svelte` so the native `type="date"` input is the hit target (opacity-0 overlay or equivalent — not `sr-only` + `showPicker`-only)
- [x] Preserve formatted display, disabled state, `testid`, `aria-label`, trailing snippet hit area
- [x] Soften/remove Spec 047 toggle-close expectation in docs if behavior changes; keep open reliable
- [x] `npm run check` clean; Playwright date-field (and existing tx smoke) pass
- [x] Update `specs/README.md` status → Accepted when landing
- [x] Commit + draft PR linking Spec 100
