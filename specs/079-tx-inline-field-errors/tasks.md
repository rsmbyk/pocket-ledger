# Tasks 079: Inline field errors on all forms

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** classify known messages → field vs form (if helper extracted)
- [ ] **Red Playwright:** tx zero amount → under Amount; pocket bad opening → under Opening; one of category/lock/unlock
- [ ] **Green** QuickAddSheet field-keyed errors
- [ ] **Green** PocketsPanel form field-keyed errors
- [ ] **Green** CategoriesPanel name errors under field
- [ ] **Green** MorePanel lock + UnlockScreen passphrase errors
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit with pack
