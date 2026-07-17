# Plan 054: Transaction header icons

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Sheet titles alone don’t cue mode; a small header icon next to the title clarifies Add vs Edit vs Voided.

## Scope / edges

**In:** `txHeader` icons — Add = Plus, Edit = Pencil, Voided = Ban (beside title).

**Out:** Changing titles/copy; Void action button icon (already Ban); filter/discard dialogs.

## Approach

- [`QuickAddSheet.svelte`](../../src/lib/ui/QuickAddSheet.svelte) `txHeader`: render Plus / Pencil / Ban beside title based on add / edit / voided view.

## TDD

- Vitest: none
- Playwright: `e2e/tx-sheet-polish.e2e.ts` — assert `data-testid` on header icons per mode

## Out of scope

Icon-only title replacement; custom illustrations.
