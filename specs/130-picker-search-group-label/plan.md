# Plan 130: CategoryPicker search matches group labels

## What

Picker search (Activity filters + transaction sheet) matches **group name or category name**, same rule as Categories page search (124 / `filterCatalogGroups`). A group-name hit shows **all** categories in that group.

## Why

Spec 123 documented name-only search. Typing `Work` hides the whole Work section even though the heading is on screen.

## Scope

- `CategoryPicker.svelte` `visibleSections` uses `filterCatalogGroups` (or the same rule)
- Empty groups still drop out; All / Admin Fee / Uncategorized still match their own labels

## Out of this slice

- 132 used-only Activity options (picker still searches whatever list it is given)
- Categories page search (already 124)

## Edges

1. Query `work` on Income picker → Work heading + Salary, Bonus, … (all members).
2. Query `groc` → only Groceries (and its group), not the rest of Food & drink.
3. No matches → existing empty copy.
