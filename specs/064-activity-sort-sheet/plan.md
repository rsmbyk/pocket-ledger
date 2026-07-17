# Plan 064: Activity Sort sheet + icon-only Filters

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 045/049/058 (filters chrome); Spec 063 (list — sort leaves table header)

## Why

With the Activity table gone (063), date-cycle sort in a column header disappears. Ronald wants an explicit Sort control beside Filters: icon-only buttons, Sort sheet mirroring Filters sheet sides, plus a Categories order mode.

## Scope / edges

**In:** Icon-only Filters (non-xl); icon-only Sort left of Filters; Sort sheet (bottom mobile / right tablet+); four sort modes including category set-order (income first); xl keeps always-on filters drawer — Sort stays toolbar icon → right sheet.

**Out:** Always-on Sort rail on xl; changing filter fields; cycle-through header sort UX.

## Approach

- Domain: extend activity sort mode + `sortTransactions` with category meta (TDD)
- `AppShellChrome`: toolbar icons; Sort sheet; wire mode into Activity list
- Remove `nextActivityDateSort` UI cycle (helper may die if unused)
- E2E: icon Filters; open Sort; select modes

## TDD

- Vitest: `src/lib/domain/activity-filters.test.ts` (four modes + category ordering)
- Playwright: `e2e/activity-filters.e2e.ts` (or dedicated sort e2e)
