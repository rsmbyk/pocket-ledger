# Spec 123: Default catalog, category groups, chip Categories page

- **ID:** 123
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Make the locked generalized catalog the **default** ledger categories, introduce **category groups**, and rebuild the Categories page as an alphabetical **chip grid** per group. Users reorder **groups**, not categories, and only after entering reorder mode.

## Scope

### In scope

1. **Default catalog** — virgin / empty category table seeds the locked catalog (46 income, 93 expense) with Lucide icons and the locked group list (see Domain rules)
2. **Groups** — first-class rows: name, `kind` (`income` | `expense`), `sortOrder` among siblings of that kind
3. **Category fields** — `groupId`, `icon` (Lucide slug); `kind` still on the category and must match its group
4. **Categories page (normal)** — groups in default/user `sortOrder`; chips inside a group A–Z by name; chip = icon above label; trailing **add** chip per group (`tag` icon); toolbar **Add group** and **Reorder**
5. **Add category** — add chip in a group; name only; icon always `tag`; kind and group from that group
6. **Add group** — name + kind; placed last among that kind
7. **Reorder mode** — only group names; DnD within kind; **Save**, **Discard**, **Reset**; leave-page / leave-mode confirm if dirty
8. **Pickers & month charts** — list order is group `sortOrder` (Income groups then Expense groups where both show), then A–Z within group; show category icon; Uncategorized / Admin Fee unchanged (043 / 106)
9. Docs: `docs/PRODUCT.md`, `docs/DATA_MODEL.md`

### Out of scope

- Custom icon picker (user chips stay `tag`)
- Dragging a category between groups or changing category order
- Delete / rename group
- Changing system Uncategorized (`circle-dashed`) or Admin Fee (`percent`)
- Per-account category sets

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

Category names, icons, and group membership are the locked preview set (≤ 2 words, unique Lucide slugs). Implementation copies that table into domain (`default-category-catalog`). Uncategorized and Admin Fee are **not** catalog rows. Custom user chips use `tag` (never a catalog slug).

### Rows

- **Group:** `id`, `name` (trim, collapse spaces, max 40, unique among **active groups of the same kind**, case-insensitive), `kind`, `sortOrder`, `createdAt`
- **Category:** existing fields plus `groupId`, `icon`; `sortOrder` on a category is unused for UI (A–Z wins)
- Name uniqueness for categories remains **within kind** (010), among active rows
- Delete category: 103 (in-use block / void-only soft-delete / unused hard-delete)
- Soft-deleted categories stay out of the grid and pickers; names still resolve on voided txs

### Seed vs migrate

- **Empty** categories (and no groups): insert factory groups + catalog categories
- **Existing** categories: one-time migrate — create factory groups if missing; map each active category to a catalog group by **name + kind** when the name matches a catalog item (apply catalog `icon` + `groupId`); otherwise assign `tag` and the kind’s last factory group (**Care, land, other** / **Catch-all**). Do not delete user categories. Do not insert catalog rows the ledger does not already have.

### Order

- Groups of a kind: `sortOrder` ascending, then `createdAt`, then `id`
- New user group: `sortOrder = max(kind) + 1`
- Categories in a group: `name` locale-insensitive A–Z (same fold as uniqueness)
- Reorder writes group `sortOrder` only; categories never change order via DnD
- **Reset** (reorder mode): built-in groups return to factory order; user-created groups stay after them, stable by `createdAt`. Dirty until Save
- **Discard** (reorder mode): restore last **persisted** group order; stay in reorder mode
- **Save**: persist current draft order; dirty flag clears

### Icons

| Slot | Slug | Who |
| --- | --- | --- |
| Uncategorized | `circle-dashed` | `categoryId == null` only |
| Admin Fee | `percent` | transfer fee bucket only |
| Custom chip | `tag` | user-created category |
| Catalog chip | locked slug | seeded / name-matched migrate |

## Acceptance scenarios

### Scenario: Virgin seed

- **Given** an empty category table
- **When** bootstrap / `ensureSeedCategories` runs
- **Then** factory groups and all catalog categories exist with locked icons and `groupId`s
- **And** Categories shows Work before Business & creating, Home before Utilities

### Scenario: Existing ledger migrate

- **Given** an expense category named `Coffee` and no groups
- **When** migrate runs
- **Then** factory groups exist
- **And** `Coffee` is in Catch-all with icon `tag`
- **And** no extra catalog rows are inserted

### Scenario: Existing name matches catalog

- **Given** an expense category named `Groceries`
- **When** migrate runs
- **Then** it is in Food & drink with the catalog grocery icon

### Scenario: Chip grid

- **Given** a seeded ledger
- **When** the user opens `/categories` in normal mode
- **Then** each group heading is followed by rectangular chips (icon above label), categories A–Z
- **And** the last chip in each group is add (`tag`, not a category)
- **And** Income groups appear before Expense groups

### Scenario: Add category in group

- **Given** the Food & drink group
- **When** the user activates the add chip, types `Warung`, and saves
- **Then** an expense category `Warung` exists in that group with icon `tag`
- **And** it appears in A–Z order among that group’s chips
- **And** the tx expense picker lists it under that group’s order

### Scenario: Add group last

- **Given** factory expense groups
- **When** the user adds expense group `Side`
- **Then** `Side` is last among expense groups
- **And** it has an add chip and no catalog categories

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
- **And** pickers / month expense buckets follow the new group order, then A–Z

### Scenario: Reset factory order

- **Given** a saved custom group order
- **When** the user enters reorder, chooses Reset, then Save
- **Then** built-in groups match factory order
- **And** user-created groups remain after the factory list

### Scenario: Dirty leave

- **Given** reorder mode with unsaved group moves
- **When** the user navigates to Activity (or leaves reorder without Save/Discard)
- **Then** a confirm offers to stay or leave (leave discards the draft)

### Scenario: Category order not draggable

- **Given** normal mode
- **When** the user views chips
- **Then** there is no drag handle on a category chip
- **And** renaming `Dining` to `Auberge` only changes A–Z position, not group order

### Scenario: System buckets unchanged

- **Given** an uncategorized expense
- **When** it appears in Activity or month charts
- **Then** Uncategorized still uses `circle-dashed`
- **And** Admin Fee still uses `percent`

## Traceability

- Vitest: `apps/web/src/lib/domain/default-category-catalog.test.ts`, `apps/web/src/lib/domain/category-groups.test.ts`, `apps/web/src/lib/application/categories.test.ts`, `apps/web/src/lib/domain/month-summary.test.ts` (group then A–Z), `apps/web/src/lib/application/backup.test.ts` (groups + icon + groupId)
- Playwright: `e2e/categories.e2e.ts` (seed, chips, add chip, add group, reorder save/discard/reset, dirty leave); picker order in `e2e/activity-filters.e2e.ts` as needed
- Implementation: catalog module; Dexie version for `categoryGroups` + category `groupId`/`icon`; `CategoriesPanel.svelte`; pickers / month summary sort
- Docs: `docs/PRODUCT.md` (categories + groups), `docs/DATA_MODEL.md`
- Supersedes: 025 empty-start seed; 038/040 category DnD as the order UX
- Depends on: 010, 018, 021, 025 (supersede seed), 043, 103, 106, 107
