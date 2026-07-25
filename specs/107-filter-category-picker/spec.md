# Spec 107: Filter category dropdown + type coupling

- **ID:** 107
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Replace the Activity filter native category `<select>` with the same DropdownMenu category picker used on the transaction sheet. Group Income and Expenses when type is All; narrow options when type is Income or Expense; add Transfer to the type filter and disable category for transfers.

## Scope

### In scope

1. Shared `CategoryPicker` component used by Activity filters and the transaction sheet category control
2. Activity type filter options: **All | Income | Expense | Transfer**
3. When type is **All**: category menu shows **All**, then **Income** group, then **Expenses** group, then separator, then **Admin Fee**, then **Uncategorized**
4. When type is **Income** or **Expense**: only that kind’s categories (flat list), then separator + **Uncategorized**; no Admin Fee
5. When type is **Transfer**: category picker disabled; draft category forced to All (`''`)
6. On type change: clear draft category to All if the current selection is incompatible with the new type
7. Existing filter domain rules for category / Admin Fee / Uncategorized unchanged
8. Transaction sheet category control keeps prior behavior (single-kind list + Uncategorized; no All / Admin Fee) via the shared component

### Out of scope

- Multi-select categories
- Changing Admin Fee sentinel match semantics (106)
- Pocket filter UI changes
- Search / combobox inside category picker

## Domain rules

- `ActivityTypeFilter = 'all' | 'income' | 'expense' | 'transfer'`
- `filterTransactions` type rule: when type ≠ `all`, keep rows with `tx.type === type` (includes transfers)
- Category option compatibility:
  - `transfer` → no category selection (always All)
  - `income` / `expense` → user categories of that `kind` plus Uncategorized; Admin Fee incompatible
  - `all` → any user category, Admin Fee, Uncategorized, or All
- Clearing rules run when draft type changes (before Apply)

## Acceptance scenarios

### Scenario: Type All shows grouped categories

- **Given** Income category Salary and Expense category Food
- **When** Activity Filters open with type All and the user opens the category picker
- **Then** the menu shows All, an Income group containing Salary, an Expenses group containing Food, then Admin Fee, then Uncategorized

### Scenario: Type Income narrows categories

- **Given** Salary (income) and Food (expense)
- **When** the user sets type to Income and opens the category picker
- **Then** only Salary (and Uncategorized) appear; Food and Admin Fee do not

### Scenario: Type Expense narrows categories

- **Given** Salary (income) and Food (expense)
- **When** the user sets type to Expense and opens the category picker
- **Then** only Food (and Uncategorized) appear; Salary and Admin Fee do not

### Scenario: Transfer disables category

- **Given** Activity Filters open
- **When** the user selects type Transfer
- **Then** the category picker is disabled and shows All
- **And** after Apply, only transfer rows are listed

### Scenario: Incompatible category cleared on type change

- **Given** draft type All and category Food selected
- **When** the user changes type to Income
- **Then** draft category resets to All

### Scenario: Admin Fee still filters when type All

- **Given** transfers with and without fees
- **When** type is All and the user selects Admin Fee and Applies
- **Then** only non-voided transfers with `feeMinor > 0` are listed (unchanged from 106)

### Scenario: Tx sheet still uses shared picker

- **Given** Add Transaction Normal mode with type Expense
- **When** the user opens the category control
- **Then** expense categories list with Uncategorized under a separator; Admin Fee is not offered

## Traceability

- Vitest: `src/lib/domain/activity-filters.test.ts` (Transfer type + category option compatibility helpers)
- Playwright: `e2e/activity-filters.e2e.ts`; `e2e/transfer-admin-fee.e2e.ts` (category picker instead of native select)
- Implementation: `src/lib/domain/activity-filters.ts`; `src/lib/ui/CategoryPicker.svelte`; `src/lib/ui/AppShellChrome.svelte`; `src/lib/ui/QuickAddSheet.svelte`
