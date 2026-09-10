# Spec 247: Budget form/details chrome

- **ID:** 247
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Tighten the budget form and details list chrome shipped in 246: no-op actions are disabled, pocket-wide rows are marked, the list sort prefers pocket-wide then hotter/larger/older/harder rows, Applies to is searchable, and badge gaps match the used/limit stack.

## Scope

### In scope

1. **Select all** (`pocket-budget-select-all`) — native `disabled` when `isAllSelectable` (every selectable expense category is checked, including edit of a pocket-wide budget). Copy stays **Select all**. Unchecking any category re-enables. An existing pocket-wide budget does not extra-disable Select all ([249](../249-budget-unique-scope-ux/spec.md)).
2. **Pocket-wide icon** — details list title (`pocket-details-budget-title-*`) shows Landmark (`size-3.5`, `aria-hidden`) to the left of the pocket name when `appliesTo === 'pocket'`. Testid `pocket-details-budget-pocket-icon-${id}`. Category-scope rows stay text-only. Warn-dialog names stay plain text.
3. **List sort** — supersedes 246 percent → `createdAt` → `id`. `sortActiveBudgets(budgets, usedById, today)`: pocket-wide first; used percent higher first (unclamped); `limitMinor` higher first; `effectiveStartOn` oldest first; Monthly before Ongoing; Hard before not; `createdAt` oldest first; then `id`.
4. **Restart** — edit only; `disabled` when `initialStartOn === today` (stored `effectiveStartOn`, not the dirty Start date field). Monthly mid-month with a past stored `startOn` stays enabled.
5. **Applies to search** — field between Applies to / Select all and the scrollable list (`pocket-budget-applies-search`). Placeholder / aria-label **Search categories or groups**. Reuse `filterCatalogGroups`. Empty: **No matches** / **Try a different category or group name.** (`pocket-budget-applies-search-empty`). Clear query when the dialog opens. Select all still selects every selectable id, not only visible. Group check still toggles all children of that group.
6. **Badge gaps** — details row stacks title / badges / chrome with `gap-1`. Omit the badge strip when neither Hard nor Monthly.

### Out of scope

- Sticky groups, unique scope, Pockets-list budget preview (248)
- Deselect-all / toggle Select all label
- Icon in the exceed ConfirmDialog or the form header

## Domain rules

- `sortActiveBudgets` takes `today` (`YYYY-MM-DD`) so monthly rows compare `effectiveStartOn(row, today)`.
- Select all disable uses existing `isAllSelectable(selectedSet, allSelectableIds)`.

## Acceptance scenarios

### Scenario: Select all disables when complete

- **Given** Add budget is open
- **When** every selectable expense category is checked (Select all, or one-by-one)
- **Then** `pocket-budget-select-all` is disabled
- **And** unchecking Groceries re-enables it

### Scenario: Pocket-wide row shows Landmark and sorts first

- **Given** a pocket-wide budget at 0% and a Groceries budget at 150%
- **When** the details list renders
- **Then** the pocket-wide row is first
- **And** it shows the Landmark testid next to the pocket name
- **And** the Groceries row has no Landmark

### Scenario: Restart disables when the window already starts today

- **Given** a budget whose `effectiveStartOn` is today
- **When** the user opens Edit
- **Then** Restart is disabled
- **And** a budget with an ongoing `startOn` in the past still has Restart enabled

### Scenario: Applies to search

- **Given** Add budget is open
- **When** the user types `groc` in `pocket-budget-applies-search`
- **Then** Groceries is visible and Home/Rent are not
- **When** the query is `zzzz`
- **Then** the empty copy **No matches** / **Try a different category or group name.** shows

## Traceability

- Vitest: `apps/web/src/lib/domain/budgets.test.ts`
- Playwright: `e2e/budgets.e2e.ts`
- Implementation: `PocketBudgetFormDialog.svelte`; `PocketDetailsPanel.svelte`; `apps/web/src/lib/domain/budgets.ts`

## Related

- 246, 249
