# Tasks 220: DateField opens from the full chrome

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Red: `e2e/date-field.e2e.ts` — overlay fills chrome; icon-side / far-chrome click calls `showPicker`
- [x] Green: `DateField.svelte` full-width overlay + chrome `showPicker` fallback; same overlay on `MonthField.svelte`
- [x] Index in `specs/README.md`
- [x] Commit linking Spec 220
