# Spec 248: Sticky groups, unique scope, list preview

- **ID:** 248
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

A full group check should keep covering new categories in that group. Two active budgets must not share the same Applies-to key. The Pockets list shows the pocket-wide cap between the info row and the preview goal, with the bar spanning name and balance — not the grip.

## Scope

### In scope

1. **Sticky groups** — Dexie **v12**, backup + sync blob. Keep `appliesTo: 'pocket' | 'categories'`. Add `groupIds: string[]` (empty when pocket). `categoryIds` = leftover expense cats **not** covered by a sticky group.
   - Check group (or check every current child) → add `groupId`, strip those ids from `categoryIds`. Future cats in that group count (principal-only; no fees / income / transfers / Uncategorized / Admin Fee).
   - Uncheck one child of a sticky group → drop `groupId`, put the **remaining current** children into `categoryIds` (snapshot again; the unchecked one stays off; a later new sibling does not join until the group is full/sticky again).
   - All selectable cats covered (all expense groups sticky, or Select all) → `appliesTo: 'pocket'`, empty `groupIds` / `categoryIds`.
   - Used: pocket-wide unchanged. Else expense principal where `categoryId` is in `categoryIds` **or** that category’s `groupId` is in `groupIds`. Expand groups at used-time from the live catalog so new members apply without rewriting the row.
   - Title: sticky group still shows the **group name**. After a demote, names list as today.
   - **Existing rows:** on read/hydrate, if `categoryIds` currently equals all members of a group, promote those ids to `groupIds`. Persist on next Save; used can promote in memory immediately.

2. **Unique Applies to** — `budgetScopeKey`: `'pocket'` or `g:${sorted groupIds}|c:${sorted categoryIds}`.
   - At most one **active** budget per key per pocket. Dropped do not block. Create/update refuse duplicates (`except` this id). Copy: **A budget with this scope already exists on this pocket.**
   - Pocket-wide is that key for Select all. Two Groceries-only budgets forbidden. Pocket-wide + Groceries allowed. Sticky Home vs snapshot of some Home children are different keys.
   - Form chrome for uniqueness is [249](../249-budget-unique-scope-ux/spec.md): Select all stays enabled; Save refuses and shows the copy under Applies to. Duplicate leftover sets error on Save.
   - No Dexie unique index. Legacy duplicate pocket-wide: list shows one (first after current active sort); Save without changing scope still works.

3. **Pockets list card** — [PocketsPanel.svelte](../../apps/web/src/lib/ui/PocketsPanel.svelte) gets `budgets` (and enough ledger data to derive used). Two columns (149/151):
   - **Left:** grip (or Main spacer) only — full-height handle. Bars do **not** run under this column.
   - **Middle + right:** one stack (`flex-1 min-w-0`, drop `max-w-xs` on list goal chrome):
     1. Name + description | derived balance (top row, balance still top-right)
     2. **Pocket-wide budget** if any — [BudgetProgressChrome](../../apps/web/src/lib/ui/BudgetProgressChrome.svelte), Hard/Monthly badges. No extra title. Hide-amounts `••••`. Bar + percent span this combined column (under the name **and** the balance).
     3. **Preview goal** chrome if set — same span as the budget bar
   - Whole card still opens details. Category/group budgets do **not** show on the list.

### Out of scope

- Category/group budgets on the Pockets list
- Home preview
- Changing which goal `previewGoal` picks
- Spec 247 chrome (Select all when complete, Landmark, list sort, Restart, Applies-to search, badge gaps)

## Domain rules

```ts
type PocketBudget = {
  // 246 fields, plus:
  groupIds: string[]; // empty when pocket-wide
};
```

- `budgetScopeKey(b)` → `'pocket'` or `g:${sorted groupIds}|c:${sorted categoryIds}`
- `hydrateBudgetScope(b, catalog)` → promote full-group snapshots to `groupIds` in memory
- `resolveAppliesTo(selectedIds, allSelectableIds, catalog)` → pocket if all selectable; else sticky groups + leftover ids
- `txContribution` / `budgetUsedMinor` take the live catalog so sticky `groupIds` expand

## Acceptance scenarios

### Scenario: sticky group includes a category added after save

- **Given** a Home-group budget saved while Home was fully checked
- **When** a new expense category is added to Home
- **Then** spending in that category counts toward used
- **And** the details title stays **Home**

### Scenario: demote does not include later siblings

- **Given** a sticky Home budget
- **When** the user unchecks one current Home child and saves
- **Then** `groupIds` no longer includes Home
- **And** a category added to Home later does not count

### Scenario: unique Applies to

- **Given** an active pocket-wide budget
- **When** the user tries to save another pocket-wide budget
- **Then** Save shows **A budget with this scope already exists on this pocket.**
- **And** two Groceries-only budgets are refused the same way
- **And** Home sticky + Groceries is allowed
- **And** dropping the first then recreating is allowed

### Scenario: Pockets list pocket-wide chrome

- **Given** a pocket with a pocket-wide budget and a preview goal
- **When** the Pockets list renders
- **Then** budget chrome sits between the name/balance row and the goal
- **And** the bar’s left edge lines up with the name (clear of the grip)
- **And** the bar’s right edge lines up with the card inner right (under the balance)
- **And** a Groceries-only budget does not appear on the list

## Traceability

- Vitest: `apps/web/src/lib/domain/budgets.test.ts`; `apps/web/src/lib/application/budgets.test.ts`
- Playwright: `e2e/budgets.e2e.ts`
- Implementation: `apps/web/src/lib/domain/budgets.ts`; `apps/web/src/lib/data/db.ts` v12; `PocketsPanel.svelte`; `PocketBudgetFormDialog.svelte`

## Related

- 246, 247, 249
