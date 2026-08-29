# Plan 123: Default catalog, groups, chip Categories page

## What

Ship the locked generalized catalog (46 income / 93 expense, Lucide icons, named groups) as **default categories**. Rebuild `/categories` as grouped **icon chips**. Users add chips under a group (custom `tag` icon). They add groups. They reorder **groups** only, in an explicit reorder mode.

## Why

Empty-start (025) plus per-category DnD no longer matches the catalog we just locked. Groups are the unit of order; categories stay alphabetical so the grid stays predictable.

## Scope

- Seed catalog + groups on a virgin ledger (supersedes 025 empty-start)
- `categoryGroups` store; category `groupId` + `icon` (Lucide slug)
- Categories page: chips in groups; add-chip per group; add-group in normal mode
- Reorder mode: group names only, DnD within kind; Save / Discard / Reset; leave confirm if dirty
- Pickers and month charts follow **group order, then A–Z** (no category DnD)
- PRODUCT.md + DATA_MODEL.md in the same implementation PR

## Out of this slice

- User-picked icons for custom categories (always `tag`)
- Reordering or hiding individual categories
- Delete / rename **group** (add + reorder only)
- Changing Uncategorized / Admin Fee system marks
- Android

## Edges to confirm

1. **Existing ledger** (already has categories): one-time migrate — match name+kind to catalog group/icon when possible; otherwise park in that kind’s **Catch-all** (expense) or **Care, land, other** (income) with `tag`. Do **not** wipe user rows. Do **not** insert the rest of the catalog into a non-empty ledger.
2. **Reset** in reorder mode = restore **factory default group order** for built-in groups; user-created groups stay last in their kind (created order). Not saved until Save.
3. **Discard** = revert to last **saved** order, stay in reorder mode.
4. Desktop: Income groups column, then Expense (021). Mobile: stacked, Income first.
5. Rename/delete category: still allowed (chip menu), same 103 delete rules.

## Supersedes

- 025 no-seed (virgin install seeds again)
- 038 / 040 category DnD (order is group-only; categories A–Z)
- 010 “icons out of scope”
