# Plan 057: ConfirmDialog danger chrome

- **Status:** Accepted (amended)
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

DB-level destructive confirms need stronger chrome (header + icon). Discard is still irreversible at a lower level — keep a destructive confirm **button**, but no danger header.

## Scope / edges

**In:** Split `destructive` (button) vs `dangerChrome` (header). Unify Button `destructive` variant to Void outline+soft-fill. Discard keeps `destructive` only.

**Out:** Per-call-site custom icons; copy changes; in-use warn (056).

## Approach

- ConfirmDialog: `destructive` → `variant="destructive"` on confirm; `dangerChrome` → flush header + TriangleAlert
- buttonVariants.destructive matches Void (`border-destructive/40 bg-destructive/10 …`)
- Discard call sites: `destructive` without `dangerChrome`

## TDD

- Playwright: discard has destructive button, no danger header; category delete has danger header
