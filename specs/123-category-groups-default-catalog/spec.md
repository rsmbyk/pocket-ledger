# Spec 123: Overlay catalog, Categories list, searchable form picker

- **ID:** 123
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Make the locked generalized catalog the **default** categories without seeding Dexie. Stock lives in the app bundle with stable ids. Each ledger stores only an overlay (custom groups/categories, hidden stock ids, group order if it differs from factory). Categories is a **list per group** with edit/hide. Transaction forms (and Activity filters) use a **searchable grouped** category picker.

## Scope

### In scope

1. **Stock catalog in the bundle** — 46 income + 93 expense, locked names/icons/groups, stable ids. Not Dexie rows, not synced, not backup blobs.
2. **Overlay** — custom groups; custom categories (encrypted, icon always `tag`); prefs: hidden stock ids; group order only when it differs from factory.
3. **Resolve at read** — factory groups + custom groups; factory cats in catalog order then customs after; pickers omit hidden.
4. **Migrate** — existing UUID categories by name+kind onto stock ids; leftovers become custom `tag` rows. Do not insert unused stock rows.
5. **Categories page (list)** — groups in user/factory order; chips = icon + label; stock cannot rename/delete; custom in-place rename in edit mode; delete = hide; hidden still listed; add-chip at end of each group; add group (kind + name, last in kind).
6. **Reorder mode** — group names only; DnD within kind; Save / Discard / Reset; dirty leave confirm.
7. **Form picker** — searchable Command combobox; income tx → income groups; expense tx → expense groups; transfer → no category field; group headings; icon + label; Uncategorized stays; hidden omitted; trigger shows icon + name.
8. **Activity filters** — same `CategoryPicker`; type All groups Income vs Expense then category groups inside; Transfer filter stays disabled + All.
9. **Month charts** — group order, then stock-then-custom (not A–Z).
10. Docs: `docs/PRODUCT.md`, `docs/DATA_MODEL.md`.

### Out of scope

- Custom icon picker (user chips stay `tag`)
- Deleting stock, deleting or renaming groups
- Dragging a category between groups or user-defined category order
- Changing system Uncategorized (`circle-dashed`) or Admin Fee (`percent`)
- Per-account category sets
- Android

## Domain rules

### Catalog (locked)

Income group order (factory):

1. Work
2. Business & creating
3. Investing & cashback
4. Property & assets
5. Benefits & support
6. Gifts & windfalls
7. Care, land, other

Expense group order (factory):

1. Home
2. Utilities
3. Food & drink
4. Transport
5. Health
6. Insurance
7. Personal
8. Family & kids
9. Pets
10. Education & work
11. Tech & subs
12. Fun
13. Travel
14. Money & civic
15. Giving & faith
16. Legal & life
17. Catch-all

Category names, icons, and group membership are the locked preview set (≤ 2 words). Implementation copies that table into domain (`default-category-catalog`). Uncategorized and Admin Fee are **not** catalog rows. Custom user chips use `tag` (never a catalog slug).

Stock ids are stable, e.g. `stock:expense:groceries`, `stock-group:home`. Duplicate display names in the same kind (two expense **Other** rows) disambiguate in the id with the group slug.

### Overlay rows

- **Custom group:** `id` (UUID), `name` (trim, collapse spaces, max 40, unique among **active groups of the same kind**, case-insensitive), `kind`, `createdAt`. Encrypted name.
- **Custom category:** `id` (UUID), `name`, `kind`, `groupId`, `icon` (`tag`), `hidden`, `createdAt`. Encrypted name. Never hard-deleted.
- **Prefs:** `hiddenStockIds`; `groupOrderByKind` only when the order is not factory (stock catalog order, then custom groups by `createdAt`).
- Name uniqueness for categories remains **within kind** (010), among **visible** stock + non-hidden custom, plus hidden custom (names stay reserved). New custom names cannot match a stock name of that kind.

### Hide vs delete

- Stock: hide/show via prefs. No rename. No delete.
- Custom: hide/show via `hidden` on the row. “Delete” in the UI means hide. Supersedes Spec 103 hard/soft delete and in-use blocking.
- Hidden omitted from pickers. Still listed on Categories so they can be shown. Existing txs keep their `categoryId`; edit may keep a hidden category already on the row.

### Seed vs migrate

- **Virgin / empty overlay:** no Dexie category or group rows. Resolve still returns the full catalog.
- **Existing UUID categories:** one-time migrate after decrypt — if name+kind matches a unique stock item (or the first catalog match when names collide), rewrite referencing `transaction.categoryId` to the stock id and drop the UUID row; if that UUID row was soft-deleted (`deletedAt`), hide the stock id. Otherwise keep as custom `tag` in the kind’s last factory group (**Care, land, other** / **Catch-all**), `hidden` if it had `deletedAt`. Do not insert unused stock rows.

### Order

- Groups of a kind: user order if persisted, else factory stock order then custom groups by `createdAt`, then `id`.
- New user group: last among that kind.
- Categories in a group: stock in **catalog order**, then custom by `createdAt`, then `id`.
- Reorder writes group-order prefs only.
- **Reset** (reorder mode): built-in groups return to factory order; user-created groups stay after them, stable by `createdAt`. Dirty until Save.
- **Discard** (reorder mode): restore last **persisted** group order; stay in reorder mode.
- **Save**: persist current draft order (omit prefs key when it matches factory); dirty flag clears.

### Icons

| Slot | Slug | Who |
| --- | --- | --- |
| Uncategorized | `circle-dashed` | `categoryId == null` only |
| Admin Fee | `percent` | transfer fee bucket only |
| Custom chip | `tag` | user-created category |
| Catalog chip | locked slug | stock catalog |

### Form picker

- Income transaction: income groups only. Expense: expense groups only. Transfer: no category field (unchanged).
- Group headings = category groups in user/factory order. Items = Lucide icon + label.
- Uncategorized remains (`circle-dashed`). Hidden cats omitted.
- Search filters by category name; empty groups drop out; empty state when nothing matches.
- Trigger shows icon + name (not name-only).
- Activity type All: kind layer (Income / Expense) then category groups inside. Transfer filter stays disabled + All.

## Acceptance scenarios

### Scenario: Virgin overlay

- **Given** an empty category table and no overlay prefs
- **When** Categories or a transaction picker opens
- **Then** Dexie still has no stock rows
- **And** the full catalog is visible (Work before Business & creating, Home before Utilities, Groceries under Food & drink)

### Scenario: Existing ledger migrate

- **Given** an expense category named `Coffee` (UUID) and no groups
- **When** migrate runs
- **Then** Dexie has a custom `Coffee` row in Catch-all with icon `tag`
- **And** no extra catalog rows are inserted

### Scenario: Existing name matches catalog

- **Given** an expense category named `Groceries` (UUID) referenced by a transaction
- **When** migrate runs
- **Then** the transaction’s `categoryId` is the stock groceries id
- **And** the UUID row is gone

### Scenario: Categories list

- **Given** a virgin overlay
- **When** the user opens `/categories` in normal mode
- **Then** each group heading is followed by rectangular chips (icon + label) in catalog order
- **And** the last control in each group is add (`tag`, not a category)
- **And** Income groups appear before Expense groups
- **And** stock chips have no rename or delete control

### Scenario: Add category in group

- **Given** the Food & drink group
- **When** the user activates the add chip, types `Warung`, and saves
- **Then** an expense category `Warung` exists in that group with icon `tag`
- **And** it appears after stock chips in that group
- **And** the expense picker lists it under Food & drink

### Scenario: Uniqueness vs stock

- **Given** stock Groceries
- **When** the user tries to add expense `Groceries`
- **Then** the save is rejected as a duplicate name

### Scenario: Add group last

- **Given** factory expense groups
- **When** the user adds expense group `Side`
- **Then** `Side` is last among expense groups
- **And** it has an add chip and no stock categories

### Scenario: Hide stock and custom

- **Given** stock Groceries and custom Warung
- **When** the user hides both
- **Then** both remain on the Categories list
- **And** neither appears in the expense picker
- **And** showing them restores them to the picker

### Scenario: Edit mode rename custom only

- **Given** edit mode
- **When** the user renames Warung to `Warung kopi`
- **Then** the custom row is renamed
- **And** stock names stay read-only

### Scenario: Reorder mode chrome

- **Given** normal Categories
- **When** the user chooses Reorder
- **Then** category chips are hidden
- **And** only group names are shown, DnD-enabled within kind
- **And** Save, Discard, and Reset are visible

### Scenario: DnD group persists only on Save

- **Given** reorder mode
- **When** the user drags Utilities above Home and does not save
- **Then** a refresh / Discard shows Home before Utilities again

### Scenario: Save group order

- **Given** Utilities above Home in the reorder draft
- **When** the user saves
- **Then** that order persists after leaving reorder mode
- **And** pickers / month expense buckets follow the new group order, then stock-then-custom

### Scenario: Reset factory order

- **Given** a saved custom group order
- **When** the user enters reorder, chooses Reset, then Save
- **Then** built-in groups match factory order
- **And** user-created groups remain after the factory list

### Scenario: Dirty leave

- **Given** reorder mode with unsaved group moves
- **When** the user navigates to Activity (or leaves reorder without Save/Discard)
- **Then** a confirm offers to stay or leave (leave discards the draft)

### Scenario: Searchable form picker

- **Given** an expense transaction sheet
- **When** the user opens Category
- **Then** the list is grouped (Food & drink contains Groceries)
- **And** typing `groc` leaves Groceries and drops empty groups
- **And** the trigger shows the groceries icon and name after select
- **And** income groups are absent

### Scenario: Activity filter type All

- **Given** the Activity category filter with type All
- **When** the picker opens
- **Then** Income and Expense kind layers each contain category groups
- **And** search still filters by category name

### Scenario: System buckets unchanged

- **Given** an uncategorized expense
- **When** it appears in Activity or month charts
- **Then** Uncategorized still uses `circle-dashed`
- **And** Admin Fee still uses `percent`

## Traceability

- Vitest: `apps/web/src/lib/domain/default-category-catalog.test.ts`, `apps/web/src/lib/domain/category-overlay.test.ts`, `apps/web/src/lib/application/categories.test.ts`, `apps/web/src/lib/domain/month-summary.test.ts` (group then stock-then-custom), `apps/web/src/lib/application/backup.test.ts` (custom groups + overlay prefs, no stock rows)
- Playwright: `e2e/categories.e2e.ts` (list, add chip, add group, hide, reorder save/discard/reset, dirty leave, picker search/groups/icons/type coupling); helpers in `e2e/nav.ts`
- Implementation: catalog module; Dexie `categoryGroups` + category overlay fields; `CategoriesPanel.svelte`; `CategoryPicker.svelte` Command combobox
- Docs: `docs/PRODUCT.md`, `docs/DATA_MODEL.md`
- Supersedes: 025 empty-start seed as “insert rows”; 038/040 category DnD; 103 delete
- Depends on: 010, 018, 021, 043, 106, 107
