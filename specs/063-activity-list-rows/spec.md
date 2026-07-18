# Spec 063: Activity list rows like Recent

- **ID:** 063
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Replace the Activity transactions **table** with a stacked **list** that matches Home Recent row chrome, including a three-line layout when a transaction has a note.

## Scope

### In scope

1. Remove Activity shadcn table (headers Date / Category / Amount) on **all** viewports
2. Activity list uses the same row pattern as Home Recent:
   - Primary: category name (or Uncategorized)
   - Trailing: signed amount + chevron
   - Void: muted row + strikethrough amount (unchanged semantics)
3. **Text stack:**
   - **No note:** 2 lines — category, then date (`text-xs`)
   - **Has note:** 3 lines — category, then note (`text-xs`), then date (`text-xs`) — note between category and date (not `note · date` on one line)
4. Keep `data-testid="activity-list"`; row opens edit
5. Update Home Recent to the same 2-/3-line stack so both surfaces match
6. Keep Activity search, filters (sheet/drawer), Add, empty states

### Out of scope

- Sort UI / sort modes (Spec 064)
- Changing filter criteria
- Amount-hide on Activity (Home only)
- Restoring a Note column or table headers

## Domain rules

- No new money/ledger rules
- Display dates via existing `formatOccurredOnDisplay`
- Note line only when `note` trims to non-empty

## Acceptance scenarios

### Scenario: Activity is a list, not a table

- **Given** Activity with at least one transaction
- **When** the panel renders
- **Then** there is no Date/Category/Amount column header row
- **And** `activity-list` shows stacked list rows

### Scenario: Two-line row without note

- **Given** a transaction with empty/whitespace note
- **When** it appears in Activity (or Home Recent)
- **Then** the left stack shows category then date only (two text lines)

### Scenario: Three-line row with note

- **Given** a transaction with note `"Coffee"`
- **When** it appears in Activity (or Home Recent)
- **Then** the left stack shows category, then `Coffee`, then date (three text lines in that order)

### Scenario: Row opens edit

- **Given** an Activity list row
- **When** the user activates it
- **Then** the edit transaction dialog opens for that row

## Traceability

- Vitest: none (unless shared pure helpers)
- Playwright: `e2e/desktop-layout.e2e.ts`, `e2e/activity-filters.e2e.ts`, `e2e/polish.e2e.ts` (as needed); Home Recent coverage if present
- Implementation: `src/lib/ui/ActivityTable.svelte` (or rename), `src/lib/ui/AppShellChrome.svelte`, shared row component

## Related

- Spec 013 (introduced Activity table)
- Spec 023 / 051 (Recent secondary line; Activity Note column removed — 063 supersedes single-line `note · date` on Recent)
- Spec 064 (Sort sheet + icon Filters)
