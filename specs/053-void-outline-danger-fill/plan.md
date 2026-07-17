# Plan 053: Void outline + danger fill

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Void already uses outline + destructive text, but the red tint only appears on hover. A persistent soft fill makes the control read as dangerous at rest.

## Scope / edges

**In:** Transaction sheet Void button: keep outline + add resting `bg-destructive/10` (hover can deepen).

**Out:** Confirm dialog chrome (057); Void domain rules; Categories delete button (already outlined).

## Approach

- [`QuickAddSheet.svelte`](../../src/lib/ui/QuickAddSheet.svelte): Void button classes include persistent `bg-destructive/10` (not hover-only).

## TDD

- Vitest: none
- Playwright: extend `e2e/tx-sheet-polish.e2e.ts` class regex for resting fill

## Out of scope

Changing Void confirm copy or placement.
