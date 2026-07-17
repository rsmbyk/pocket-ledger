# Tasks 057: ConfirmDialog danger chrome

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Branch `feat/051-057-ui-polish` (shared pack)
- [ ] Red Playwright:
  - [ ] Category delete confirm → `confirm-dialog-danger-header` visible
  - [ ] Discard filters confirm → danger header absent; confirm not destructive variant
  - [ ] Discard unsaved (optional) → danger header absent
- [ ] Green UI: `ConfirmDialog.svelte` danger header layout
- [ ] Call-site audit: drop `destructive` on discard filters + discard unsaved
- [ ] `npm run check` + e2e
- [ ] Traceability in `./spec.md`
- [ ] Note on Spec 015 that danger chrome is delivered by 057
