# Plan 123: Overlay catalog, Categories list, searchable form picker

## What

Ship the locked generalized catalog (46 income / 93 expense, Lucide icons, named groups) as **stock in the app bundle**. Dexie stores only a per-ledger overlay: custom groups, custom categories, hidden stock ids, and group order when it differs from factory. Rebuild `/categories` as a **list per group** (edit/hide, not a chip grid). Replace the transaction **CategoryPicker** with a searchable grouped Command combobox.

## Why

Seeding every catalog row into Dexie (and sync/backup) would freeze unused stock and fight catalog updates. Overlay resolve-at-read keeps virgin installs empty in IndexedDB while the full catalog still appears on screen. Groups are the unit of order; category order inside a group is catalog then custom.

## Scope

- Domain catalog with stable ids (`stock:expense:groceries`, `stock-group:home`)
- Overlay merge, hide/show, migrate existing UUID rows by name+kind
- Custom groups + custom categories (encrypted); custom icon always `tag`
- Categories page: list per group, add-chip, add group, edit/hide, reorder mode
- Form + Activity `CategoryPicker`: Command search, group headings, icons
- Month charts follow group order, then stock-then-custom
- PRODUCT.md + DATA_MODEL.md in the same implementation PR

## Out of this slice

- User-picked icons for custom categories (always `tag`)
- Deleting stock categories or deleting/renaming groups
- Changing Uncategorized (`circle-dashed`) or Admin Fee (`percent`) system marks
- Android

## Edges

1. **Virgin install:** empty Dexie; resolve paints the full catalog. Catalog updates ship with the app.
2. **Existing ledger:** one-time migrate — match name+kind onto stock ids (rewrite `transaction.categoryId`); leftovers become custom `tag` rows in Catch-all / Care, land, other. Do not insert unused stock rows.
3. **Hide:** stock ids live in prefs; custom rows get `hidden` (never hard-delete; supersedes Spec 103). Hidden omitted from pickers; still listed on Categories so they can be shown.
4. **Reset** (reorder mode) = factory group order; user groups stay last in kind. Not saved until Save.
5. **Discard** = last persisted order; stay in reorder mode.
6. Desktop: Income column then Expense (021). Mobile: stacked, Income first.

## Supersedes

- 025 no-seed (virgin still inserts nothing; catalog is resolved, not seeded)
- 038 / 040 category DnD (order is group-only)
- 103 hard/soft delete (hide instead)
- 010 “icons out of scope”
