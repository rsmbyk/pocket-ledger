# Spec 144: Type / Pocket filter checkboxes like Category

- **ID:** 144
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Filters **Type** and **Pocket** look and toggle like Category: a left square checkbox per row, menu stays open while checking, no All row. Empty still means All (139).

## Scope

### In scope

1. **Type** and **Pocket** menus: left-square check (empty box / check inside) aligned with Category’s multi rows. Command’s trailing indicator hidden.
2. **Stay open** while toggling. Closing is outside click, Escape, or leaving via the Filters sheet — same as Category.
3. **No All row.** Unchecking the last item returns to All. Trigger copy unchanged: `All` / one label / `N selected` (139 `filterTriggerSummary`).
4. **Testids unchanged:** `activity-filter-type`, `activity-filter-type-income|expense|transfer`, `activity-filter-pocket`, `activity-filter-pocket-option-{id}`.
5. Pocket rows still use `PocketLabel` (optical Main icon). Type rows: Income, Expense, Transfer.

### Out of scope

- Changing `filterTransactions` / empty=All / badge counting (139)
- CategoryPicker (already this chrome; search + groups stay)
- Search on Type/Pocket
- Tx-sheet Category/Pocket (single)
- Amount, Show voided, date range
- Restyling global `DropdownMenu.CheckboxItem`

## Domain rules

- None. Keep 139: empty list = All; OR within the field after Apply.

## Acceptance scenarios

### Scenario: Left squares stay open (Type)

- **Given** Filters are open and Type is All
- **When** the user opens Type and checks Income then Expense
- **Then** both rows show a filled left square
- **And** the Type menu is still open
- **And** the Type trigger reads `2 selected`

### Scenario: Uncheck back to All

- **Given** Type has Income and Expense checked
- **When** the user unchecks both
- **Then** the trigger reads `All`
- **And** the menu is still open

### Scenario: Pocket same chrome

- **Given** two pockets exist
- **When** the user opens Pocket and checks one, then another
- **Then** both rows show left squares filled
- **And** the Pocket menu is still open
- **And** the trigger reads `2 selected`

### Scenario: Category unchanged

- **Given** the Category filter is visible
- **When** the user opens Category
- **Then** it still has search, groups, and the same left-square multi checks as today

## Traceability

- Vitest: n/a (no matching change)
- Playwright: `e2e/activity-filters.e2e.ts` — stay-open Type two-check; uncheck to All; Pocket stay-open. Update `setFilterTypes` if `aria-checked` is no longer on the row.
- Implementation: `apps/web/src/lib/ui/FilterCheckSelect.svelte`; `AppShellChrome.svelte` Type/Pocket; keep `CategoryPicker.svelte`

## Related

- 139 multi-select; 107 type→category; 075 pocket filter
