# Spec 246: Pocket budgets

- **ID:** 246
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Give each pocket spending caps. A budget applies to the whole pocket or to selected expense categories. Details shows used vs limit with the inverse of the goal bar colors. Soft budgets warn on save and still post; hard-limit budgets refuse the save.

## Scope

### In scope

1. **Entity** — Dexie `budgets`: `id`, `accountId`, `appliesTo` (`pocket` | `categories`), `categoryIds`, `limitMinor`, `hardLimit`, `period` (`ongoing` | `monthly`), `startOn` (`YYYY-MM-DD`), `createdAt`, `cancelledAt`, `deletedAt`. Unlimited rows. Overlapping scopes allowed. Sync `kind: 'budget'`. Encrypted backup includes `budgets`; missing key on import is empty. Reset clears. Soft-delete on Drop (`cancelledAt` + `deletedAt`); never `db.budgets.delete` for Drop.
2. **Used (never stored)** — Window `[effectiveStartOn, today]` inclusive (`todayOccurredOn()`). Future-dated and pre-start txs do not count and do not warn. Voided txs do not count. Plans do not count.
   - **Category scope:** non-voided **expenses** on this pocket whose `categoryId` is in `categoryIds`. Principal only (`amountMinor`). Fees, income, transfers, Uncategorized, and Admin Fee do not count.
   - **Pocket-wide:** every non-voided **expense** on this pocket (principal **+** fee, including Uncategorized and Admin Fee / pick-Admin-Fee) **plus transfer-out** (this pocket is `accountId` on a `transfer`: principal **+** fee). Incoming transfers and income do not count.
3. **Monthly period** — Do not rewrite `startOn` at month turn by itself. `effectiveStartOn = period === 'monthly' ? max(startOn, first of today’s month) : startOn`.
4. **Exceed** — Warn/block only when `used + thisTxContribution > limitMinor` (exactly at the cap is allowed). Edit: subtract this row’s current contribution, then add the new one. Income never warns.
5. **Bar** — `budgetBarFillCss(p) = goalBarFillCss(100 - clamp(p, 0, 100))` (171 stops). Width `min(percent, 100)%`. Percent **text may exceed 100**. Hide-amounts (048 / 089) hides money here too.
6. **Details card** (`pocket-details-budgets-card`) — always on, between Plans and Goals (xl lists column and stacked layout). Title **Budgets**. Header **Add Budget** (`pocket-details-add-budget`). Empty (`pocket-details-budgets-empty`): **No budgets** / **Budgets you add will show up here.** List (`pocket-details-budgets-list`). No See more, no history. Click row → edit. Sort superseded by [247](../247-budget-chrome/spec.md).
7. **Row** — (1) title: pocket name if pocket-wide, else catalog order with **full groups collapsed to the group name**, `line-clamp-2` + ellipsis; (2) badges **Hard** / **Monthly**; (3) used / limit; (4) percent; (5) bar.
8. **Form** (`pocket-budget-form-dialog`) — field order: **Applies to** → **Amount** → **Start date** → **Period** → **Hard limit**. Save disabled when nothing applies / invalid limit / edit unchanged vs the populated snapshot (034). Dirty leave matches the goal dialog. Editing a budget does not rewrite txs; used is always derived.
9. **Applies to** — scrollable expense groups/categories (stock + custom), **including hidden** (muted). Omit income. Omit synthetic Admin Fee and Uncategorized. Groups expand/collapse (default expanded). Group check = all children; uncheck group = uncheck all children; uncheck one child of a full group = uncheck the group; indeterminate when partial. **Select all** (`pocket-budget-select-all`) ⇒ `appliesTo: 'pocket'` (auto-includes future expense categories, uncategorized, fees, transfer-out). Checking every selectable expense category is the same as Select all. Unchecking any category demotes to an id list.
10. **Start date** — `DateField` (`pocket-budget-start-input`), `max` = today, no `min`. Create defaults to today. Edit **populates with `effectiveStartOn`**, not stored `startOn`. Save writes the field to `startOn`. Dirty baseline is that populated value.
11. **Restart** (edit only, `pocket-budget-restart`) — ConfirmDialog (warning chrome, not danger). Title **Restart this budget?** Body **The start date becomes today. Spending from before today will no longer count toward the used amount. Unsaved edits on this form will be discarded.** Confirm **Restart** (`pocket-budget-restart-confirm`) / Cancel **Cancel**. Confirm persists `startOn = today` (other stored fields unchanged), then closes both the confirm and the form. Cancel returns to the open form.
12. **Drop** (edit only, `pocket-budget-drop`) — ConfirmDialog **Drop this budget?** / **Drop** (`pocket-budget-drop-confirm`), danger chrome (057). Sets `cancelledAt` + `deletedAt`.
13. **Tx save** — Before `add`/`update` (including transfer): if any active budget on the affected pocket(s) would exceed, show ConfirmDialog. Overlay **cannot** dismiss (`interactOutsideBehavior="ignore"`). Escape = Close.
    - No hard limit among hits (warning chrome): Close = **save anyway**. Other action **View pocket** = go to `/pockets/:id` (create: `writeTxCreateDraft` then close sheet; edit: close without saving).
    - Any hit is hard (danger chrome): do **not** create/update. Close = keep sheet open. View pocket = draft (create) / discard (edit) + navigate.
    - One dialog listing all hit budgets. Mixed hard+soft → danger + block.
14. **Delete pocket** — Refuse while any non-dropped budget exists (copy: *Drop all budgets first.*). Cascade Drop leftover dropped rows when an unused pocket is deleted.

### Out of scope

- Home / Pockets-list preview
- `/budgets` page
- Income caps
- OS notifications
- Yearly period
- Android

## Domain rules

### Shape

```ts
type PocketBudget = {
  id: string;
  accountId: string;
  appliesTo: 'pocket' | 'categories';
  categoryIds: string[]; // empty when pocket
  limitMinor: number; // positive integer
  hardLimit: boolean;
  period: 'ongoing' | 'monthly';
  startOn: string; // YYYY-MM-DD
  createdAt: string;
  cancelledAt: string | null;
  deletedAt: string | null;
};
```

### Helpers (names may vary)

- `isActiveBudget(b)` → `deletedAt` and `cancelledAt` both null
- `effectiveStartOn(b, today)` → monthly: `max(startOn, YYYY-MM-01 of today)`; else `startOn`
- `budgetProgressPercent(limitMinor, usedMinor)` → `round(used/limit * 100)` (not clamped)
- `budgetBarFillCss(percent)` → `goalBarFillCss(100 - clamp(percent, 0, 100))`
- `txContribution(budget, tx, today)` → 0 if voided or outside window; else rules in scope §2
- `budgetUsedMinor(budget, txs, today, exceptId?)` → sum of contributions
- `budgetWouldExceed(budget, txs, proposed, today, replacingId?)` → used (excluding replacing) + contribution(proposed) `> limitMinor`
- `sortActiveBudgets(budgets, usedById, today)` → see [247](../247-budget-chrome/spec.md)
- Group check / Select all / title collapse as in scope §7–9

### Mutate

- Create: `cancelledAt`/`deletedAt` null. `startOn` ≤ today. `appliesTo: 'pocket'` or non-empty `categoryIds`. `limitMinor` positive.
- Update: only active. May change applies, amount, start, period, hard limit.
- Restart: only active. `startOn = today`. Other fields unchanged.
- Drop: only active. `cancelledAt = now`, `deletedAt = now`.
- Start date on save: the form field value (edit was opened as `effectiveStartOn`).

### Crypto / backup / sync

- Plain: ids, flags, `limitMinor`, dates, `categoryIds` (same as goal amounts/dates).
- Signed-in: PUT/GET `kind: 'budget'`. Dropped rows stay (soft-delete in the blob), not server gravestones unless the whole entity is gone.
- Backup JSON includes `budgets`; missing key → `[]`.

## Acceptance scenarios

### Scenario: Details card always shown, empty

- **Given** a pocket with no active budgets
- **When** details opens
- **Then** `pocket-details-budgets-card` is visible between Plans and Goals
- **And** `pocket-details-budgets-empty` shows **No budgets**
- **And** `pocket-details-add-budget` is visible
- **And** there is no See more / history control on the card

### Scenario: Create pocket-wide budget

- **Given** details for Main
- **When** the user Adds a budget, Select all, amount `100000`, Period Ongoing, Start date today, Hard limit off, Save
- **Then** `appliesTo` is `pocket`
- **And** the row title is **Main**
- **And** used is 0 / limit and 0%

### Scenario: Category scope principal only

- **Given** a Groceries budget of `10000` and an expense Groceries `8000` with fee `500` on that pocket in the window
- **When** details renders
- **Then** used is `8000` (fee excluded)

### Scenario: Pocket-wide includes fees and transfer-out

- **Given** a pocket-wide budget and, in the window: expense `1000` fee `100`, transfer out `2000` fee `50`, income `9000`, transfer in `3000`
- **When** used is computed
- **Then** used is `3150`

### Scenario: Monthly window

- **Given** today `2026-09-09`, monthly budget `startOn` `2026-08-15`, and expenses `2026-08-20` and `2026-09-02`
- **When** used is computed
- **Then** only the September expense counts
- **And** the edit Start date field shows `2026-09-01`

### Scenario: Soft exceed warns and can save

- **Given** a non-hard budget used `9000` / `10000`
- **When** the user saves an expense of `2000` in scope
- **Then** a warning dialog lists the budget and cannot be closed by the overlay
- **And** Close posts the transaction
- **And** the bar is full and percent text is `110%`

### Scenario: Hard limit blocks

- **Given** a hard-limit budget that the same expense would exceed
- **When** the user saves
- **Then** a danger dialog shows
- **And** Close leaves the sheet open and does not create the tx
- **And** View pocket on create writes a draft and opens pocket details

### Scenario: Restart confirm

- **Given** an edit form with a dirty amount
- **When** Restart → confirm
- **Then** stored `startOn` is today and other stored fields are unchanged
- **And** the form and confirm close
- **When** Restart → Cancel
- **Then** the form stays open with the dirty amount

## Traceability

- Vitest: `apps/web/src/lib/domain/budgets.test.ts`; `apps/web/src/lib/application/budgets.test.ts`; `apps/web/src/lib/application/accounts.test.ts` (delete blocker); `apps/web/src/lib/application/budget-form-dirty.test.ts`
- Playwright: `e2e/budgets.e2e.ts`; layout order in `e2e/pocket-details.e2e.ts`
- Implementation: domain `budgets.ts`; Dexie v11; `application/budgets.ts` + repo; sync `kind: 'budget'`; backup + reset; `PocketDetailsPanel.svelte`; budget dialog; `QuickAddSheet.svelte`; `ConfirmDialog.svelte` overlay-ignore; `docs/PRODUCT.md`; `docs/DATA_MODEL.md`

## Related

- 152 pocket goals (card chrome, Drop, hide-amounts)
- 171 goal bar color (mirrored here)
- 174 / 237 Admin Fee
- 223 Plans (details card neighbor)
- 235 pocket details columns
