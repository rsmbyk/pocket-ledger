# Spec 139: Filters Type / Category / Pocket multi-select

- **ID:** 139
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Transactions Filters **Type**, **Category**, and **Pocket** are multi-select. Empty means All. Matching is OR within a field and AND across fields.

## Scope

### In scope

1. Type, Category, Pocket menus: checkboxes; stay open while toggling. No exclusive All checkbox — clearing all checks returns to All.
2. **Trigger:** `All` when empty; the one label when a single value; `N selected` when two or more.
3. **Type:** Income, Expense, Transfer. Category disabled only when the type set is **Transfer-only** (107). Mixed types keep category on; options are the union of selected income/expense kinds (132 used-only). Transfer-only still forces category to All. Type changes drop incompatible category ids.
4. **Category:** used-only list + Uncategorized / Admin Fee (132 / 106); multi OR. Admin Fee still only matches fee transfers.
5. **Pocket:** a row matches if it **touches any** selected pocket (transfers: source or dest).
6. **Add-tx default pocket:** if the applied set is exactly one pocket, use it; otherwise Main (078).
7. **Session (102):** persist arrays. Old single `type` / `categoryId` / `pocketId` coerce to one-element lists or All.
8. Amount, search, dates (141), voided (140) are other slices. Tx sheet Category/Pocket stay **single** select.

### Out of scope

- Multi-select on the transaction form
- Changing Admin Fee match semantics (106)
- Amount lt/gt control

## Domain rules

- Empty type list = all types. Else `tx.type` must be in the list.
- Empty category list = no category constraint. Else match Uncategorized / Admin Fee sentinels or `categoryId` as today, OR’d.
- Empty pocket list or `all` = all pockets. Else `accountId` or `counterAccountId` in the selected set.
- `isCategoryFilterDisabled` when the type set is exactly `{ transfer }`.
- Category option kinds = union of selected income/expense types; if types empty (All), same as today’s type All.

## Acceptance scenarios

### Scenario: Two types OR

- **Given** an income and an expense in range
- **When** the user selects Type Income and Expense (not Transfer) and Applies
- **Then** both rows show
- **And** a transfer does not

### Scenario: Trigger labels

- **Given** no Type checks
- **When** the Type trigger renders
- **Then** it reads `All`
- **Given** only Food is checked for Category
- **Then** the Category trigger reads `Food`
- **Given** two pockets checked
- **Then** the Pocket trigger reads `2 selected`

### Scenario: Transfer-only disables category

- **Given** Type is Transfer only
- **When** Filters render
- **Then** Category is disabled and treated as All

### Scenario: Pocket touches either side of a transfer

- **Given** a transfer Main → Savings
- **When** Pocket filter is Savings only
- **Then** the transfer is included

### Scenario: Add default

- **Given** applied pocket filter is exactly Savings
- **When** the user opens Add Transaction (Normal)
- **Then** the pocket field defaults to Savings
- **Given** two pockets are applied
- **Then** Add defaults to Main

## Traceability

- Vitest: `apps/web/src/lib/domain/activity-filters.test.ts` — OR/AND, Transfer-only disable, pocket touch, session coerce in `activity-list-session.test.ts`
- Playwright: `e2e/activity-filters.e2e.ts`
- Implementation: `activity-filters.ts`; `activity-list-session.ts`; `AppShellChrome.svelte`; filter CategoryPicker multi mode (tx sheet stays single)
- Related: 075, 078, 107, 132

## Related

- 140 show voided; 141 header range
