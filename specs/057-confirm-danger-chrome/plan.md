# Plan 057: ConfirmDialog danger chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

DB-level destructive confirms look the same as mild “discard edits” confirms. Stronger chrome (header bar + alert icon) should reserve for irreversible data actions; discard stays plain.

## Scope / edges

**In:** When `destructive` is true, ConfirmDialog shows flush danger header + TriangleAlert + title; body/description + destructive confirm button below. Audit call sites so discard flows drop `destructive`.

**Out:** Per-call-site custom icons; copy changes; in-use category warn chrome (056 stays non-destructive).

## Approach

- [`ConfirmDialog.svelte`](../../src/lib/ui/ConfirmDialog.svelte): if `destructive`, match Categories add-dialog header pattern (`p-0` content, `border-b bg-destructive/5` header with icon).
- Drop `destructive` on: Activity discard filters; tx discard unsaved.
- Keep `destructive` on: category/recurring/goal delete, import backup, void, disable lock, reset local data (if ConfirmDialog).

## TDD

- Vitest: none
- Playwright: category delete confirm shows danger header testid; discard-filters confirm has no danger header

## Out of scope

AlertDialog redesign; toast system.
