# Tasks 224: Repeating Plans

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/223-plans` (same wave as 223)
- [x] Red Vitest: `apps/web/src/lib/domain/plan.test.ts` — weekly +7; monthly last-day clamp; 31 Jan → Feb end → 31 Mar; Once unchanged
- [x] Red Vitest: `apps/web/src/lib/application/plans.test.ts` — Save/Skip advance; Save for next writes tx info only; Once has no Save for next
- [x] Green: Repeat field; `monthDay`; advance; Save for next; list chips
- [x] Red/Green Playwright: `e2e/plans.e2e.ts` — labels from Due; chip; Save for next; template amount after accept Save
- [x] Index in `specs/README.md`; PRODUCT Repeat note
- [x] Commit linking Spec 224
