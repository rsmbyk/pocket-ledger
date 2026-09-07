# Tasks 224: Repeating Plans

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted
- [ ] Branch: `feat/224-repeating-plans` (after 223 lands)
- [ ] Red Vitest: `apps/web/src/lib/domain/plan.test.ts` — weekly +7; monthly last-day clamp; 31 Jan → Feb end → 31 Mar; Once unchanged
- [ ] Red Vitest: `apps/web/src/lib/application/plans.test.ts` — Save/Skip advance; Save for next writes tx info only; Once has no Save for next
- [ ] Green: Repeat field; `monthDay`; advance; Save for next; list chips
- [ ] Red/Green Playwright: `e2e/plans.e2e.ts` — labels from Due; chip; Save for next; template amount after accept Save
- [ ] Index in `specs/README.md`; PRODUCT Repeat note
- [ ] Commit linking Spec 224
