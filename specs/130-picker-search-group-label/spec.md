# Spec 130: CategoryPicker search matches group labels

- **ID:** 130
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Searching in the shared category dropdown filters by **group label** as well as category label, matching Categories page search (124).

## Scope

### In scope

1. **Shared picker** — Activity filters and the transaction-sheet category control (`CategoryPicker`) use one search rule.
2. **Match** — Case-insensitive substring on **group name** or **category name**.
3. **Group-name hit** — If the group label matches, show **every** category in that group (not only name hits).
4. **Category-name hit** — Keep that group, but only matching members (124).
5. **Specials** — All / Admin Fee / Uncategorized still match only their own labels (not via a group name).
6. Empty groups drop out; empty state stays “No matching categories.”

### Out of scope

- Changing which categories are passed in (132 Activity used-only)
- Categories page `category-search` (already 124)
- Selecting a group heading as a value
- Android

## Domain / UI rules

Reuse `filterCatalogGroups` from Spec 124. Blank query → unfiltered sections (plus specials). Spec 123 “search filters by category name” is superseded **for the picker only**.

## Acceptance scenarios

### Scenario: Group label shows the whole group

- **Given** Income picker with Work (Salary, Bonus, …)
- **When** the user types `work` in `category-picker-search`
- **Then** the Work group heading is visible
- **And** Salary and Bonus (and the other Work members in the list) are visible
- **And** a category in a non-matching group (e.g. Interest) is not

### Scenario: Category substring still narrows members

- **Given** Expense picker with Food & drink (Groceries, Dining, …)
- **When** the user types `groc`
- **Then** Groceries is visible
- **And** Dining is not
- **And** Home / Rent is not

### Scenario: No matches

- **Given** the picker is open
- **When** the user types `zzzz`
- **Then** the empty copy is shown
- **And** no category options are listed

### Scenario: Activity filter uses the same search

- **Given** Activity filters, type All, picker open
- **When** the user types a stock group name that exists in the current option list
- **Then** that group’s members in the list are all shown

## Traceability

- Vitest: `apps/web/src/lib/domain/category-catalog-filter.test.ts` (124 cases stay; add a picker-shaped fixture only if the helper is wrapped)
- Playwright: `e2e/categories.e2e.ts` (tx add picker: search `Work` or `Food`); `e2e/activity-filters.e2e.ts` (filter picker group query)
- Implementation: `apps/web/src/lib/ui/CategoryPicker.svelte`
- Docs: this folder; `specs/README.md` index
- Depends on: 107, 123, 124
- Supersedes (picker search only): 123 “Search filters by category name”

## Related

- 124 `filterCatalogGroups`; 132 does not change this matcher
