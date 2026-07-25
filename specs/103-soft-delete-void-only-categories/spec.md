# Spec 103: Soft-delete categories used only by voided txs

- **ID:** 103
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Allow deleting a category that is referenced only by voided transactions by **soft-deleting** it (`deletedAt`), so voided history still resolves the category name while the category disappears from live lists and pickers. Categories still used by active transactions remain blocked (Spec 056). Unused categories stay hard-deleted.

## Scope

### In scope

1. Soft-delete when confirm-delete and the category is referenced only by voided transactions
2. Hard-delete when confirm-delete and no transaction references the category
3. Keep Spec 056 in-use warn when any **active** (non-voided) transaction references the category
4. Hide soft-deleted categories from Categories panel, add/edit pickers, and activity category filters
5. Keep soft-deleted rows available for id→name display on historical/voided rows
6. Soft-deleted names do not block uniqueness — user may recreate the same name
7. Export/import persist `deletedAt`; missing on import → active (`null`)
8. Update product delete rule in `docs/PRODUCT.md`

### Out of scope

- Soft-deleting categories that still have active transactions
- Restore / un-delete category UI
- Soft-deleting pockets, accounts, or goals
- Reassign / merge category UX
- Changing void money rules

## Domain rules

- `CategoryRow.deletedAt: string | null` — ISO timestamp when soft-deleted; `null` = active
- A category is **actively in use** when at least one transaction with `voidedAt == null` has that `categoryId`
- `removeCategory`:
  - Rejects when actively in use (existing “still used” error)
  - Soft-deletes (sets `deletedAt`) when only voided transactions reference it
  - Hard-deletes when no transactions reference it
- Active category lists exclude rows with `deletedAt != null`
- Name uniqueness and sort/reorder operate on active categories only
- Relaxes Spec 010 / 014 / 056: voided-only references no longer block delete; soft-archive is in scope for this case only

## Acceptance scenarios

### Scenario: Void-only category soft-deletes

- **Given** a category referenced only by voided transaction(s)
- **When** the user confirms Delete
- **Then** the category disappears from the Categories panel and pickers
- **And** the category row remains in storage with `deletedAt` set
- **And** voided transactions still show that category’s name

### Scenario: Active use still blocks

- **Given** a category referenced by at least one non-voided transaction
- **When** the user clicks Delete
- **Then** the Spec 056 in-use warning appears
- **And** the category remains active (`deletedAt` null)

### Scenario: Unused hard-deletes

- **Given** a category with no transaction references
- **When** the user confirms Delete
- **Then** the category is hard-deleted from storage

### Scenario: Soft-deleted name can be reused

- **Given** a soft-deleted expense category named “Coffee”
- **When** the user creates a new expense category named “Coffee”
- **Then** creation succeeds as a new id

### Scenario: Backup round-trips deletedAt

- **Given** a backup that includes a category with `deletedAt` set
- **When** the user restores that backup
- **Then** the category remains soft-deleted and hidden from active lists
- **And** a legacy backup missing `deletedAt` restores the category as active

## Traceability

- Vitest: `src/lib/application/categories.test.ts`; backup coverage in existing backup tests if present
- Playwright: `e2e/categories.e2e.ts`
- Implementation: `src/lib/data/db.ts`, `src/lib/data/category-repo.ts`, `src/lib/application/categories.ts`, `src/lib/application/backup.ts`, `src/lib/ui/CategoriesPanel.svelte`, `src/App.svelte`, `docs/PRODUCT.md`

## Related

- Spec 010 (custom categories)
- Spec 014 (void transactions — previously counted voided toward in-use)
- Spec 056 (category in-use warn)
