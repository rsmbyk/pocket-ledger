# Tasks 059: Remove Net worth

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Red: remove/fail net-worth Playwright in `e2e/base-features.e2e.ts`
- [x] Green UI: remove More Net worth card + App wiring
- [x] Remove `src/lib/application/net-worth.ts` + `net-worth.test.ts` (or equivalent unused)
- [x] Confirm `backup.test.ts` / `reset.test.ts` still pass with `netWorthSnapshots`
- [x] Grep: no `capture-net-worth` / `net-worth-chart` in `src/`
- [x] Update `specs/README.md` Spec 006 → Superseded; note PRODUCT/ROADMAP
- [x] `npm run check` + unit + e2e
- [x] Traceability in `./spec.md`
