# Spec 148: Pocket details page

- **ID:** 148
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Give each pocket a **details dashboard** at `/pockets/:id`: a stack of infographic cards (who it is, current balance, optional opening, optional goal, this pocket’s month summary, latest activity). The Pockets list stays a roster. Clicking a **card** opens details. Edit is the details toolbar (`pocket-details-edit`); list pencil was removed in spec 149.

## Scope

### In scope

1. **Path** — `/pockets/:id` is a real details view. `parsePath` still returns `pockets` (nav **Pockets** stays highlighted). A single extra path segment is the pocket id. Extra segments under a real id stay on details ([204](../204-nearest-parent-url/spec.md)); unknown id still replace-navigates to `/pockets`. Trailing slash on `/pockets/:id/` is the same details view.
2. **List hit target** — Activating the pocket **card** (name, balance, goal chrome, description, empty padding) navigates to `/pockets/{id}`. Prefer a real link (`href`) so middle-click / keyboard work. **The drag handle does not navigate** (`stopPropagation` / sit outside the link). List pencil / delete / clear-goal were removed in spec 149.
3. **Toolbar** — On details: Back (`pocket-details-back`) + `page-title` is the pocket name with Main `Landmark` icon when `isMain`. Back goes to `/pockets` via `goto` (not `history.back()`). Edit (`pocket-details-edit`) opens the **same** `pocket-form-dialog` as create/edit elsewhere. Hide-amounts eye uses the Home control and storage key (048 / 089) and hides money on this page too. Clicking nav **Pockets** from details opens the list (`/pockets`).
4. **Card stack** (single-column Home stage, `max-w-3xl`), in this order:
   1. **Descriptions** — muted **Descriptions** kicker (same chrome as the Balance label) + notes as the content. **Only when notes are non-empty.** Name lives in the toolbar, not on this card.
   2. **Balance hero** — Home-sized current derived balance (071).
   3. **Opening** — muted **Opening balance** kicker (same chrome as the Balance label) + amount + as-of date. **Only when `openingEnabled`.**
   4. **Goals** — muted **Goal** kicker (same chrome as the Balance label). Content: current / target; when a date is set, **`DD MMM YYYY (time remaining)`** (e.g. `01 May 2026 (2 months left)`); percent right-aligned above the progress bar. **Only when `goalEnabled`.** No Clear on details. List card chrome (072) is unchanged except spec 149 (no list Clear).
   5. **Month summary** — reuse `MonthSummary.svelte`, **scoped to this pocket**. Independent month cursor from Home (default current month, clamped to this pocket’s bounds).
   6. **Latest transactions** — Home Recent clone: cap **10**, header **Add Transaction**, footer **See more in Transactions** (hidden when empty — [194](../194-hide-see-more-when-empty/spec.md)).
5. **Latest 10** — Active txs only (140: voided hidden). A transfer matches if this pocket is source **or** dest (075). Order: `sortTransactions` (occurredOn desc, createdAt desc, id). Row click opens the existing tx sheet. `showPocket` on so transfers still show source → dest.
6. **Add Transaction** — Opens QuickAdd with this pocket pre-filled (`preferredAccountId` = details id) while details is showing.
7. **See more** — Sets live Transactions **applied + draft** filters to defaults with `pocketIds: [id]`, date range to **default current month** (141/142), writes that payload to the activity list session (102), then `goto('/transactions')`. Leftover type/category/search/voided/custom range are wiped. The 10-row card is all-time; Transactions after See more is month-scoped — that mismatch is intentional.
8. **Unknown / deleted id** — If the segment is not a pocket in the ledger, **replace-navigate** to `/pockets`. Do not fall through to Home. Do not render an empty details shell.
9. **Kit stub** — `apps/web/src/routes/pockets/[id]/+page.svelte` (same empty-shell pattern as `/pockets`).

### Out of scope

- Inline edit of name / opening / goal (keep the dialog)
- Delete from details (no list delete after 149; relocate later)
- Changing Home, Pockets list layout, or pocket money rules (071 / 072 / 110 Home opening)
- All-time Transactions range; 2-column dashboard; chart click → filter
- Android

## Domain rules

### Routing

- `parsePath('/pockets')` → `pockets`, no id
- `parsePath('/pockets/{id}')` → `pockets` (id via `parsePocketId` or equivalent)
- Extra segments `/pockets/{id}/…` nearest-parent to `/pockets/{id}` ([204](../204-nearest-parent-url/spec.md))
- `routeToPath('pockets')` remains `/pockets`
- Id format is not validated in the router; missing ledger row → bounce to list

### Month summary (this pocket)

Home `buildMonthSummary` without a pocket id is **unchanged** (110: Opening = sum of every pocket).

When scoped to pocket `P`:

- **Opening** = `balanceAtDayStart(P, \`${month}-01\`, txs)` only — not the all-pocket sum
- **Income / expense / net / breakdowns** count only txs in that month that belong to `P`:
  - income/expense: `accountId === P`
  - transfer Admin Fee (106): only if `P` is the **source** (`accountId === P`)
  - incoming transfers are **not** income (same as Home)
- **Ending** = Opening + Net
- Voided txs ignored (002 / 014)

**Bounds** (independent of Home): earliest = month of the earlier of this pocket’s `openingAsOf` and its non-voided touching txs; latest = current local month. Reuse `resolveMonthBounds` by passing this pocket’s txs + `[openingAsOf]`. Prev/next disabled at edges (109). Cursor is UI state on details; visiting details does not change Home’s month.

### Latest list

`latestPocketTransactions(txs, pocketId, 10)` (name may vary) = `sortTransactions(filterTransactions(txs, { pocketIds: [pocketId], showVoided: false })).slice(0, 10)`.

### See more session

A helper (name may vary) returns `{ filters: { ...DEFAULT_ACTIVITY_FILTERS, pocketIds: [id] }, range: defaultTransactionDateRange() }`. See more applies that to chrome state **and** `writeActivityListSession` so the list is correct without a reload.

## Acceptance scenarios

### Scenario: Card opens details

- **Given** the Pockets list with Main and a pocket named Vacation
- **When** the user activates the Vacation **card**
- **Then** the URL is `/pockets/{vacationId}`
- **And** `pocket-details-panel` is visible
- **And** `page-title` is `Vacation`
- **And** nav Pockets stays current

### Scenario: Details Edit opens the form

- **Given** pocket details
- **When** the user activates `pocket-details-edit`
- **Then** `pocket-form-dialog` opens

### Scenario: Back and nav return to the list

- **Given** pocket details
- **When** the user activates `pocket-details-back`
- **Then** the URL is `/pockets` and `pockets-panel` is visible
- **And** when they open details again and activate nav `nav-pockets`, the list is shown (not details)

### Scenario: Unknown id bounces to the list

- **Given** an unlocked ledger
- **When** the user visits `/pockets/not-a-real-id`
- **Then** they end on `/pockets` with `pockets-panel` visible
- **And** `home-panel` is not shown

### Scenario: Extra path segments stay on details (204)

- **Given** a pocket at `/pockets/{id}`
- **When** the user visits `/pockets/{id}/extra`
- **Then** details stay at `/pockets/{id}`
- **And** extra segments under an unknown id bounce to `/pockets` (148 unknown id + 204)

### Scenario: Descriptions and balance

- **Given** Vacation with description “Trip fund” and derived balance 80_000
- **When** details opens
- **Then** the descriptions card shows the **Descriptions** kicker and `Trip fund`
- **And** the balance hero shows 80_000 (currency format)
- **And** when description is cleared, the descriptions card is absent

### Scenario: Opening and goal cards hidden when unset

- **Given** a pocket with `openingEnabled` false and `goalEnabled` false
- **When** details opens
- **Then** `pocket-details-opening` and `pocket-details-goal` are absent
- **And** balance, month summary, and latest-tx cards are present
- **And** the descriptions card is present only if notes are non-empty

### Scenario: Opening and goal cards when set

- **Given** a pocket with opening 50_000 as of a date and a goal
- **When** details opens
- **Then** the opening card shows 50_000 and that as-of date
- **And** the goal card shows current / target, optional `date (time remaining)`, and percent above the right end of the progress bar

### Scenario: Toolbar edit opens the existing dialog

- **Given** pocket details
- **When** the user activates `pocket-details-edit`
- **Then** `pocket-form-dialog` opens for that pocket (edit mode)

### Scenario: Month summary is this pocket only

- **Given** Main has a 100_000 income this month and Vacation has a 15_000 expense this month
- **When** the user opens Vacation details on the current month
- **Then** month income is 0, expense is 15_000
- **And** Opening is Vacation’s day-start balance only (not Main + Vacation)
- **And** Home’s month summary is unchanged if the user returns to Home

### Scenario: Transfer fee on source only

- **Given** a transfer Main → Vacation with an admin fee this month
- **When** the user opens Main details
- **Then** month expense includes that fee under Admin Fee
- **When** the user opens Vacation details
- **Then** that fee is not an expense on Vacation
- **And** the transfer is not income on Vacation

### Scenario: Independent month cursor

- **Given** Home is showing a past month
- **When** the user opens pocket details
- **Then** details defaults to the current month (clamped to this pocket’s bounds)
- **And** returning to Home still shows that past month

### Scenario: Latest 10 and See more

- **Given** Vacation has 12 active txs (and one voided) across several months, plus a transfer from Main
- **When** details opens
- **Then** the latest card lists 10 rows, newest first, including the transfer, excluding the voided tx
- **When** the user activates See more
- **Then** Transactions is shown with Pocket filter Vacation (and no leftover type/category/search)
- **And** the date range is the default current month
- **And** `pocket-details-see-more` is hidden when the latest list is empty ([194](../194-hide-see-more-when-empty/spec.md))

### Scenario: Add Transaction pre-fills this pocket

- **Given** Vacation details
- **When** the user activates Add Transaction on the latest card
- **Then** QuickAdd opens with Vacation selected as the pocket

### Scenario: Hide amounts

- **Given** details with non-zero balance
- **When** hide-amounts is on (same preference as Home)
- **Then** balance, opening, goal money, month summary amounts, and latest row amounts are masked (048 / 089)

### Scenario: Drag handle does not open details

- **Given** the Pockets list
- **When** the user uses the drag handle
- **Then** the URL stays `/pockets`

## Traceability

- Vitest: `apps/web/src/lib/shared/router.test.ts`; `apps/web/src/lib/domain/month-summary.test.ts`; `apps/web/src/lib/domain/activity-filters.test.ts` (latest-10 helper if added there) or a small pocket-details helper test; `apps/web/src/lib/shared/activity-list-session.test.ts` (See more payload)
- Playwright: `e2e/pocket-details.e2e.ts`; touch `e2e/pockets.e2e.ts` / `e2e/router.e2e.ts` if list click or `/pockets/:id` deep-link needs it
- Implementation: `router.ts`; `MonthSummary` reuse; `PocketsPanel` card link; new `PocketDetailsPanel` (or equivalent); `AppShell` / `AppShellChrome` path + toolbar; Kit stub `apps/web/src/routes/pockets/[id]/+page.svelte`; See more writes live filters + session
- Docs: this folder; `specs/README.md`; `docs/PRODUCT.md` + `docs/ARCHITECTURE.md` in the implementation PR
- Depends on: 070–072, 075, 086, 102, 106, 109–110, 117, 134, 140–142

## Related

- 070 list CRUD; 071 derived balance; 072 goal chrome; 075 / 139 pocket filter; 066 / 134 See more copy (this slice **does** pass a pocket filter, unlike 066); 149 list card states (no list pencil)
- 110 Home Opening remains all-pockets; this spec adds a **scoped** call site only
