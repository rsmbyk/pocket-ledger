# Spec 249: Budget unique-scope form UX

- **ID:** 249
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Duplicate Applies-to is discovered on Save, with the reason on the Applies-to field — not by disabling Select all.

## Scope

### In scope

1. **Select all** — `pocket-budget-select-all` is **not** disabled because another active pocket-wide budget exists. Spec 247 still disables it when `isAllSelectable` (every selectable expense category is checked).
2. **Save** — still not uniqueness-gated. Empty picker / invalid amount / not dirty stay as today (`scopeOk`, `validLimit`, `validStart`, `dirty`).
3. **Refuse** — create/update still throw `DUPLICATE_BUDGET_SCOPE` from the application layer (`assertUniqueScope`). Dialog stays open.
4. **Field error** — that message renders **after** the Applies-to checkbox list (`pocket-budget-applies-error`). Changing Applies to (group, category, or Select all) clears it.

### Out of scope

- HTTP uniqueness or a new API route
- Dexie unique index
- Changing the error copy
- Home list preview
- Spec 247 complete-picker disable, Landmark, sort, Restart, search, badge gaps
- Spec 248 sticky groups, unique keys, Pockets-list chrome

## Domain rules

Uniqueness stays Spec 248 (`budgetScopeKey`, `findDuplicateActiveScope`, `assertUniqueScope`). This slice only changes form chrome around that refuse.

## Acceptance scenarios

### Scenario: Select all stays enabled when a pocket-wide budget exists

- **Given** an active pocket-wide budget
- **When** Add budget opens
- **Then** `pocket-budget-select-all` is enabled
- **When** the user clicks Select all, enters an amount, and Save
- **Then** Save is clickable
- **And** the dialog stays open
- **And** `pocket-budget-applies-error` shows **A budget with this scope already exists on this pocket.** under the checkbox list

### Scenario: Groceries duplicate errors the same way

- **Given** an active Groceries-only budget
- **When** Add budget opens
- **Then** Select all is enabled
- **When** the user checks Groceries, enters an amount, and Save
- **Then** `pocket-budget-applies-error` shows the same copy
- **And** the dialog stays open

### Scenario: Changing Applies to clears the error

- **Given** the duplicate Applies-to error is showing
- **When** the user unchecks a selected category (or Select all on a non-complete picker)
- **Then** `pocket-budget-applies-error` is gone

### Scenario: Select all still disables when complete (247)

- **Given** Add budget is open on a pocket with no budgets
- **When** every selectable expense category is checked
- **Then** `pocket-budget-select-all` is disabled
- **And** unchecking Groceries re-enables it

## Traceability

- Playwright: `e2e/budgets.e2e.ts`
- Implementation: `PocketBudgetFormDialog.svelte`
- Uniqueness (unchanged): `apps/web/src/lib/domain/budgets.ts`; `apps/web/src/lib/application/budgets.ts`

## Related

- 247, 248
