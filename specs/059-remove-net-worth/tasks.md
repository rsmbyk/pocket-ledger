# Tasks 059: Remove Net worth

- **Status:** Draft (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Red: remove/fail net-worth Playwright in `e2e/base-features.e2e.ts`
- [ ] Green UI: remove More Net worth card + App wiring
- [ ] Remove `src/lib/application/net-worth.ts` + `net-worth.test.ts` (or equivalent unused)
- [ ] Confirm `backup.test.ts` / `reset.test.ts` still pass with `netWorthSnapshots`
- [ ] Grep: no `capture-net-worth` / `net-worth-chart` in `src/`
- [ ] Update `specs/README.md` Spec 006 → Superseded; note PRODUCT/ROADMAP
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
