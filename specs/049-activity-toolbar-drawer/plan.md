# Plan 049: Activity toolbar, drawer, sort icons, Clear

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Corrects Spec 045 layout/drawer delivery (toolbar adjacency; true ≥1280 drawer)

## Why

045 asked for Filters collapsed behind one control and a real xl drawer. Current UI stacks Filters under Add and fakes the drawer with a Sheet overlay. Date sort also reuses the same down-arrow for createdAt and occurredOn desc.

## Scope / edges

**In:** Filters to the right of search; Add below right-aligned; ≥1280 in-layout drawer (no portal overlay); distinct sort icons; Clear outline chrome.

**Out:** Changing Apply/draft filter model; amount-hide (048); tx sheet (047).

## Approach

- Toolbar: row1 `flex` search + Filters; row2 Add with `ml-auto` / `justify-end`.
- `xlWide`: render filter panel in Activity flex layout (`activity-filters-drawer`); keep Sheet for `<1280`.
- ActivityTable: History (or clock) for `createdAt-desc`; down/up (or calendar+arrow) for occurred modes.
- Clear: `variant="outline"` (visible border), not ghost.

## TDD

- Vitest: none unless extracting `dateSortIcon` helper
- Playwright: extend `e2e/activity-filters.e2e.ts` (+ optional `e2e/activity-toolbar.e2e.ts`)

## Out of scope

Nav drawer changes; persisting filters.
