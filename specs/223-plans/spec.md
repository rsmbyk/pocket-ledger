# Spec 223: Plans (one-shot)

- **ID:** 223
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Let the user keep **Plans** — expected money that is **not** on the ledger until they accept an occurrence. Home pings the next week. Pocket details and `/plans` manage the reminders. Repeat is **Once** only (224 adds Weekly / Monthly).

## Scope

### In scope

1. **Entity** — Dexie `plans`. Sync `kind: 'plan'`. Encrypted backup includes `plans`; missing key on import is empty. Reset clears. Field-crypto seals `description` and `note`. Do not revive `recurringRules`.
2. **Nav** — sixth item **Plans** at `/plans`. Sidebar and command palette order: **Home, Pockets, Transactions, Plans, Categories, Settings**. `AppRoute` includes `plans`. Invalid `/plans/…` walks to `/plans` (204).
3. **Create** — **Add Plan** on pocket details (pocket implied) and on the Plans page (pocket field when more than one pocket, hidden when only Main — 192). Not on Home. Not inside Add Transaction.
4. **Row chrome** — all three lists: header (Plan Description; Once has no Repeat chip) above tx-info (`TransactionListRow` language; date is `dueOn`).
5. **Home card** (`home-plans-card`) — after the balance hero; all pockets; `today-7 <= dueOn <= today+7`; hide when empty; no Add; no See more; no search/filters.
6. **Pocket details card** (`pocket-details-plans-card`) — after the balance hero; all **active** Plans for that pocket; always shown; header **Add Plan**; empty like Recent (032).
7. **Plans page** — Transactions chrome **minus date range**: search, Filters button/drawer, **Add Plan**. Own session key `pocket-ledger-plans-list`. Search matches description, note, and amount (same loose amount match as 017). Filters: **type**, **category**, and **pocket** (244; 223 shipped type and pocket only). List: all active Plans, grouped by `dueOn`, **nearest first**; within a day: pocket list order (Main, then `sortOrder`), then `createdAt` desc, then `id`.
8. **Click** — Home → accept mode. Pocket details: in the 1-week window → accept; else edit. Plans page → always edit.
9. **Edit mode** — Description, Tx info (Income / Transfer / Expense through Note; date label **Due**), Repeat locked to **Once** (224 unlocks Weekly / Monthly). **Drop plan** above footer (Drop-goal chrome). Footer **Cancel** | **Save** (Save writes the Plan, does not post).
10. **Accept mode** — two sections: read-only Description + Repeat; editable Tx info (`occurredOn` defaults to `dueOn`). **Skip this occurrence** above footer (confirm). Footer **Cancel** | **Save**. Save posts a normal tx from current tx info and completes the Once Plan (gravestone). Cancel leaves the Plan unchanged. No Save draft (184). No Save for next (224).
11. **Drop plan** — confirm → sync gravestone. Posted txs stay.
12. **Pocket delete** — refuse while any **active** Plan uses that pocket as `accountId` or transfer `counterAccountId`.
13. **Category in use** — an active Plan’s `categoryId` counts (same idea as old recurring in 056).

### Out of scope

- 224 Repeat (Weekly / Monthly, advance, Save for next, list chips)
- 225 existing Close → Cancel
- 226 icon rail
- OS push, auto-post, Past / Pause, yearly, RRULE, “already in the ledger”

## Domain rules

### Shape

```ts
type PlanFrequency = 'once'; // 224 adds 'weekly' | 'monthly'

type LedgerPlan = {
  id: string;
  description: string; // trim; empty = no title on rows
  type: 'income' | 'expense' | 'transfer';
  amountMinor: number;
  feeMinor: number;
  categoryId: string | null;
  accountId: string;
  counterAccountId: string | null;
  note: string;
  dueOn: string; // YYYY-MM-DD
  createdAt: string; // ISO
  frequency: PlanFrequency;
};
```

Active = row present (not a sync gravestone). Drop / Once-complete / Once-skip → `deleted=true` gravestone like transactions.

Money views ignore Plans. `derivePocketBalance` / month charts unchanged.

**Home window:** `todayOccurredOn()` local calendar; inclusive `today-7 … today+7`.

**Accept Save:** create income/expense/transfer via existing tx rules from the form; then gravestone the Once Plan. Changing accept-mode fields does not rewrite the Plan.

**Skip this occurrence (Once):** gravestone; no tx.

**Ask later:** Cancel / dismiss without Save or Skip.

### Plans page sort

1. Group by `dueOn` ascending (soonest first).
2. Within a group: Main first, then non-Main `sortOrder` ascending (same as Pockets list), then `createdAt` descending, then `id`.

### Search

Case-insensitive substring on `description` and `note`; amount via existing `amountDigitsMatch`.

## Acceptance scenarios

### Scenario: Future-dated tx is not a Plan

- **Given** an expense with `occurredOn` next month
- **When** Home and pocket balances render
- **Then** that expense is included in money views
- **And** it does not appear on the Plans card

### Scenario: Home 1-week window

- **Given** active Plans due yesterday, in 3 days, and in 3 weeks
- **When** Home renders
- **Then** `home-plans-card` lists the first two only
- **And** the 3-week Plan is absent

### Scenario: Home empty hides the card

- **Given** no Plan in the 1-week window
- **When** Home renders
- **Then** `home-plans-card` is not shown

### Scenario: Pocket details lists all for that pocket

- **Given** a Plan due in 3 weeks on Main
- **When** Main details opens
- **Then** that Plan is on `pocket-details-plans-card`

### Scenario: Click Home opens accept mode

- **Given** a 1-week-window Plan on Home
- **When** the user activates the row
- **Then** the modal is accept mode (description read-only; Skip this occurrence visible)
- **And** Save posts a ledger tx and the Plan is gone

### Scenario: Click Plans page opens edit mode

- **Given** the same 1-week-window Plan
- **When** the user opens it from `/plans`
- **Then** the modal is edit mode (description editable; Drop plan visible)
- **And** Save does not post a tx

### Scenario: Accept Save posts; Skip does not

- **Given** accept mode on a Once expense Plan
- **When** the user Saves
- **Then** a matching expense exists and the Plan is gravestoned
- **When** instead they confirm Skip this occurrence
- **Then** no new tx and the Plan is gravestoned

### Scenario: Plans search includes description

- **Given** a Plan description `Rent` and note `landlord`
- **When** Plans search is `Rent`
- **Then** the row is shown
- **When** search is `landlord`
- **Then** the row is shown

### Scenario: Plans filters are type and pocket only

Superseded by [244](../244-plans-category-filter/spec.md) (Category added; still no date range or show-voided).

- **Given** `/plans`
- **When** Filters opens
- **Then** Type and Pocket controls are present
- **And** there is no date range or show-voided control

### Scenario: Nav order

- **Given** the primary nav
- **When** it renders
- **Then** items are Home, Pockets, Transactions, Plans, Categories, Settings

### Scenario: Drop plan

- **Given** edit mode on a Plan
- **When** the user confirms Drop plan
- **Then** the Plan is gone from lists
- **And** any txs already posted stay

## Traceability

- Vitest: `apps/web/src/lib/domain/plan.test.ts`; `apps/web/src/lib/application/plans.test.ts`; `apps/web/src/lib/application/backup.test.ts` (plans round-trip / missing key); `apps/web/src/lib/shared/router.test.ts`; `apps/web/src/lib/domain/plan-filters.test.ts`
- Playwright: `e2e/plans.e2e.ts`; `e2e/router.e2e.ts` (nav-plans, `/plans`); `e2e/base-features.e2e.ts` (no leftover Recurring)
- Implementation: domain `plan` + `plan-filters`; Dexie `plans`; `application/plans.ts`; sync `kind: 'plan'`; field-crypto; backup/reset; `AppShell*` / `PocketDetailsPanel`; Plan modal; `/plans` route; `docs/DATA_MODEL.md`; `docs/PRODUCT.md`

## Related

- 004 (archive), 087, 014, 032, 056, 058, 121, 134, 152, 184, 192, 204
- Follow-ups: 224, 225, 226
