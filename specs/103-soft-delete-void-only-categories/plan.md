# Plan 103: Soft-delete categories used only by voided txs

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 010 / 014 / 056 (voided refs previously blocked delete)

## Why

Voided transactions keep `categoryId`, so a category used only by voided history cannot be removed under the current in-use guard. Soft-delete keeps the row for name lookup while hiding it from live category UX.

## Scope / edges

**In:** Soft-delete (`deletedAt`) when delete is confirmed and only voided txs reference the category; hard-delete when unused; keep Spec 056 warn when any active tx references it; hide soft-deleted from lists/pickers/filters; include soft-deleted in id→name display map; free name uniqueness; backup round-trip `deletedAt`.

**Out:** Soft-delete with active txs; restore/un-delete UI; soft-delete pockets/accounts/goals; reassign/merge; changing void money rules.

## Approach

- Dexie schema bump: `CategoryRow.deletedAt: string | null`
- Split usage: active vs void-only; `removeCategory` soft- or hard-deletes
- `listCategories` / type pickers exclude soft-deleted; `listAllCategories` (or equivalent) for display map + backup
- Categories panel: `isCategoryInUse` = active use only
