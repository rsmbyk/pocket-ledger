# Plan 063: Activity list rows like Recent

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 013 (Activity table); Spec 023 / 051 (Recent note line; Activity Note column removed); Spec 064 (Sort sheet)

## Why

The Activity table (Date / Category / Amount columns) feels different from Home Recent. Ronald wants one list language: stacked rows with category primary and date secondary, and a dedicated note line when present.

## Scope / edges

**In:** Replace Activity table with stacked list on all viewports; shared row chrome with Home Recent (2-line / 3-line); keep search, filters, edit-on-tap, empty states, void styling.

**Out:** Sort/Filters toolbar chrome (064); amount-hide on Activity; restoring table headers / Note column.

## Approach

- Extract shared `TransactionListRow` (or equivalent)
- Rewrite `ActivityTable.svelte` → list (`activity-list`); update Home Recent markup
- E2E: drop `columnheader` Date; assert list row structure / note lines

## TDD

- Playwright: activity / desktop-layout / goals-adjacent as needed; Home Recent note layout
- Vitest: none required unless row helpers extracted to domain
