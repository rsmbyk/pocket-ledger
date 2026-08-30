# Spec 127: Categories reorder drop-between

- **ID:** 127
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While reordering Categories groups, the user can drop the dragged group **between** two others. Neighbors must not stay glued so that slot never opens.

## Scope

### In scope

1. **Drop between** — In reorder mode, dragging a group by its handle into the space between two adjacent groups places it there. The two neighbors are no longer adjacent after the drop.
2. **Row gap** — Reorder rows have a visible vertical gap (at least **8px**) so a slot exists between items. Flush `divide-y` with no gap is not the reorder list.
3. **Zone behavior** — If gap alone still bunches items, adjust svelte-dnd-action options (and drop the extra Svelte `animate:flip` if it fights the zone). Do not change the 125 session contract.
4. **Handle** — Reorder remains drag-handle-only (grip). Label text is not the drag source.

### Out of scope

- Categories view-mode chrome, tap-to-hide, long-press (126)
- Chip / category DnD; renaming or deleting groups
- Dual-kind snapshot, Save / Discard / Reset, search-hidden-in-reorder (125)
- Overlay persist rules (123: omit a kind’s order key when it matches factory)
- Android

## Domain / UI rules

- Draft shape and dirty rules stay Spec 125 (`KindGroupOrder`, `isReorderDirty`, Save writes both kinds).
- No new persist API. `consider` / `finalize` still update `draft[selectedKind]` from the live item id list.
- Reorder list: column of group rows with **≥ 8px** gap between consecutive row boxes (margin or gap, not overlapping hit targets).
- Drop index follows the pointer: when the drag is released in the gap between row *i* and row *i+1* (or over the half of a neighbor that means “insert here”), the dragged id sits between those two ids.
- Adjacent rows must be able to separate during the drag (a gap or placeholder opens). They must not translate as one locked pair that skips the insert index.

## Acceptance scenarios

### Scenario: Drop between two neighbors

- **Given** Expenses reorder and factory order Home, Utilities, Food & drink (and the rest)
- **When** the user drags Food & drink by its handle and drops it between Home and Utilities
- **Then** the on-screen order starts Home, Food & drink, Utilities
- **And** Home and Utilities are not adjacent
- **And** Save is enabled (session dirty)

### Scenario: Discard still restores

- **Given** the previous between-drop is unsaved
- **When** the user chooses Discard
- **Then** view mode returns
- **And** after Reorder again, factory order is Home, then Utilities, then Food & drink

### Scenario: Rows are not flush

- **Given** reorder mode
- **When** two consecutive group rows are measured
- **Then** the space between the first row’s bottom and the next row’s top is at least 8px

### Scenario: Grip is still the handle

- **Given** reorder mode
- **When** the list is shown
- **Then** each row has a drag handle with an accessible name starting with `Drag to reorder`

## Traceability

- Vitest: none new (125 `category-reorder-session.test.ts` stays the session contract)
- Playwright: `e2e/categories.e2e.ts` (drag Food & drink between Home and Utilities; Discard restores; row gap ≥ 8px)
- Implementation: `CategoriesPanel.svelte` reorder `<ul>` / zone options only
- Docs: this folder; `specs/README.md` index
- Depends on: 123, 125
- Related: 126 (do not mix)

## Related

- 125 reorder session; Pockets list already uses gapped DnD rows
