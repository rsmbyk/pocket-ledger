# Spec 038: Categories menu redesign

- **ID:** 038
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Redesign the Categories panel and add dialog: reorderable lists, clearer income/expense chrome, icon Add, and safer modal dismiss (same outside-click pattern as Spec 037).

**Supersedes** the unnumbered “icon Add only” plan formerly sketched as 033 — icon Add lives here.

## Scope

### In scope

1. **Reorder** — within Income and within Expense only; persist order; up/down icon buttons per row (no DnD library)
2. **Add icon-only** — Plus on each card; aria-labels **Add income category** / **Add expense category**; keep testids `category-add-income` / `category-add-expense`
3. **Card kind visuals** — clear visual distinction between Income and Expense cards (accent / separation)
4. **Kind icons** — header icons for Income vs Expense (e.g. TrendingUp / ShoppingBag)
5. **Create modal kind chrome** — strong visual for income vs expense; kind still fixed by which Add was used (018)
6. **Submit label** — primary button text **Add** (not “Add category”); keep `data-testid="category-add"`
7. **Disable Add** — when trimmed name is empty
8. **Outside click** — do not dismiss; emphasis animation on the dialog (same behavior as Spec 037 tx sheet)

### Schema

- Add `sortOrder: number` on categories; Dexie version bump; migrate existing rows by current name order within kind
- New categories get `sortOrder` = max(kind) + 1
- `reorderCategory(id, 'up' | 'down')` swaps with neighbor of same kind
- List/sort by `sortOrder` ascending, then name

### Out of scope

- Cross-kind reorder
- Spec 032 empty-state copy (may share icons)
- Spec 034 save emphasis (separate; can land alongside)
- Spec 037 transaction sheet (implement independently; share outside-click pattern)

## Domain rules

- Name uniqueness within kind unchanged (010)
- Delete-when-unused unchanged
- Transaction/recurring category pickers use the same sort order as the Categories menu

## Acceptance scenarios

### Scenario: Reorder within kind

- **Given** two expense categories A above B
- **When** the user moves B up
- **Then** B appears above A and the order persists after reload

### Scenario: Icon Add

- **Given** Categories
- **When** the Income or Expense Add control is shown
- **Then** it is icon-only with an appropriate aria-label

### Scenario: Kind chrome on cards and create modal

- **Given** Categories and the add dialog for expense
- **When** both render
- **Then** expense vs income is visually obvious on the card and in the dialog (icons / accent)

### Scenario: Add disabled when empty

- **Given** the create dialog with an empty name
- **When** the form shows
- **Then** Add is disabled

### Scenario: Outside click emphasizes

- **Given** an open create-category dialog
- **When** the user presses outside
- **Then** the dialog stays open and plays an emphasis animation

## Traceability

- Vitest: reorder / sortOrder migration helpers
- Playwright: `e2e/categories.e2e.ts` (Add label, disabled, reorder, outside click)
- Implementation: `CategoriesPanel.svelte`; `categories.ts`; `db.ts` / category-repo
- Depends on: 010, 018, 021, 022; pairs with 037 for dismiss pattern and category dropdown order
