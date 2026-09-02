# Spec 147: Categories reorder whole-row drag

- **ID:** 147
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While reordering Categories groups, the **whole row** is the drag source. Pointer-down on the label, padding, or grip starts the same svelte-dnd-action drag as the six-dot handle does today.

## Scope

### In scope

1. **Whole-row drag** — In reorder mode, pointer-down anywhere on a group row (`li`, including name, padding, and grip) begins the same drag as today’s grip. Drop, consider/finalize, and dirty rules stay 125 / 127.
2. **Both kinds** — Income and Expenses share that list treatment.
3. **Drop-between** — Spec 127 gap (≥ 8px) and between-slot behavior stay. This slice only changes **what starts** the drag.
4. **Grip** — The six-dot icon stays as a visual affordance. It is **not** the exclusive handle.
5. **Keyboard / a11y** — Keep native list semantics (`ul` / `li` listitem). Do not turn the row into a button. Do not break svelte-dnd-action’s keyboard reordering.

### Out of scope

- Reset of both kinds; Discard confirm (146)
- Hairline separators between reorder rows
- Factory catalog order (123)
- Pockets list DnD (still handle-only unless a later spec)
- View-mode cards, chip drag, group rename/delete
- Amount filter; Android

## Domain / UI rules

- No new persist API. `consider` / `finalize` still update `draft[selectedKind]` from the live item id list (125).
- Reorder list remains a column of group rows with **≥ 8px** gap (127).
- The reorder `li` is the svelte-dnd-action item. Do not limit pointer drag to a nested handle (`dragHandle` / zone `handle`).
- Nested grip chrome must not swallow the row drag: pointer-down on the grip still starts the **same** row drag.
- Accessible name: if the grip stays a control, it may keep `aria-label` starting with `Drag to reorder`. That name is an affordance, not a claim that only the grip drags.

## Acceptance scenarios

### Scenario: Label starts the drag (Income)

- **Given** Income reorder and factory order Work, Business & creating, Investing & cashback
- **When** the user pointer-downs on the group name **Business & creating** (not the six-dot icon) and drops that row above Work
- **Then** the on-screen order starts Business & creating, Work, Investing & cashback
- **And** Save is enabled (session dirty)

### Scenario: Grip still starts the same drag (Expenses)

- **Given** Expenses reorder and factory order Home, Utilities, Food & drink (and the rest)
- **When** the user drags Food & drink **by the grip** and drops it between Home and Utilities
- **Then** the on-screen order starts Home, Food & drink, Utilities (127)

### Scenario: Padding is also a drag source

- **Given** reorder mode
- **When** the user pointer-downs on empty padding inside a group row (not the toolbar, not another row) and moves
- **Then** that row is the dragged item
- **And** drop-between still follows 127

### Scenario: Rows stay gapped

- **Given** reorder mode
- **When** two consecutive group rows are measured
- **Then** the space between the first row’s bottom and the next row’s top is at least 8px (127)

### Scenario: Listitem semantics

- **Given** reorder mode
- **When** the list is shown
- **Then** groups are `li` listitems in a `ul`
- **And** svelte-dnd-action keyboard reordering still works (the zone is not handle-only)

## Traceability

- Vitest: none new (125 `category-reorder-session.test.ts` stays the session contract)
- Playwright: `e2e/categories.e2e.ts` — Income: drag Business & creating **by the label** above Work; keep 127 Expenses grip between-drop; gap ≥ 8px
- Implementation: `CategoriesPanel.svelte` reorder list — drop `dragHandle` / handle-only zone so the `li` is the source; grip icon may remain
- Docs: this folder; `specs/README.md` index
- Depends on: 125, 127
- Related: 123 catalog; 126 view chrome; 146 Reset/Discard (do not mix)

## Related

- **Supersedes** Spec 127 “Handle — Reorder remains drag-handle-only (grip). Label text is not the drag source.” and the “Grip is still the handle” scenario. Drop-between gap and slot behavior in 127 stay.
- 125 reorder session; Pockets stay handle-only
