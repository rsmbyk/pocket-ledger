# Tasks 080: Dirty modal keep-open on discard

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Playwright:** dirty outside → discard + tx sheet still open; cancel keeps sheet; discard then reopen Add
- [ ] **Green** QuickAddSheet: preventDefault outside/escape + refuse close while dirty, then open discard
- [ ] Audit Activity filters discard path — no regression
- [ ] Audit other dirty + discard surfaces if any
- [ ] `npm run check` + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit with pack
