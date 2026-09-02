# Spec 142: Transactions range picker + sticky chrome band

- **ID:** 142
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Transactions, the date range is a **single button** in a **second sticky band** under the page title bar (not in the toolbar). Opening it shows Month vs Manual in one popover: a 12-month grid, or From/To plus one day calendar for a custom range. Search, Filters, and Add Transaction stick in that same band.

## Scope

### In scope

1. **Page header** — menu, title, theme/lock only. Date range leaves the header (supersedes Spec 141 placement).
2. **Sticky chrome band** — flush under the header with a divider (`border-b`), `sticky top-14`, `bg-background`, header-matching horizontal padding. Sibling of `app-stage` (not inside stage `p-4` / `gap-4`). Contains, in order: date trigger; search + Filters icon; Add Transaction (right-aligned). Wide layout: band spans the inset above the list + drawer.
3. **Trigger** — one `h-9` control with calendar icon. Closed label: Month mode → `formatMonthLabel` (e.g. `September 2026`); Manual → from–to via `formatOccurredOnDisplay` (e.g. `01 Sep 2026 – 02 Sep 2026`). Testid `activity-range-trigger` inside `activity-range`.
4. **Popover** — bits-ui Popover only. Segmented **Month | Manual** inside (`activity-range-mode-month`, `activity-range-mode-manual`). Session `mode` remains `'month' | 'custom'` (Manual is UI copy for `custom`).
5. **Month interior** — year chevrons + 3×4 month names. Selecting a month applies `rangeFromMonthKey` (current month through today; other months full) and may close the popover.
6. **Manual interior** — From and To chips **and** one Sunday-start day calendar in the same popover. First click sets start (and end to that day); second click sets end (snap if reversed). Prev/next month on the day grid does not change mode. Range highlight between start and end. Live apply (no Apply in the picker).
7. **Mode switch** — Month → Manual keeps bounds; Manual → Month snaps to the month of start (141).
8. **Domain** — unchanged from 141. Filters still have no From/To. Clear does not reset this control.

### Out of scope

- Third-party calendar widget / new calendar npm package
- Home month chevrons / month summary
- All-time list
- Sticky date-group `<li>`s in the list
- xl in-layout drawer overlay (049)

## Domain rules

- Same as Spec 141 (`transaction-date-range.ts`).
- Manual picker click mapping is presentation state (`picking` start vs end) plus `rangeFromCustom` / snap.

## Acceptance scenarios

### Scenario: Date is not in the page header

- **Given** Transactions
- **When** the page header renders
- **Then** `activity-range` is not a descendant of the page `<header>`
- **And** the title row is a single sticky bar

### Scenario: Chrome band sticks under the title

- **Given** Transactions with enough rows to scroll
- **When** the user scrolls the list
- **Then** the date trigger, search, Filters (when present), and Add Transaction remain visible flush under the title bar

### Scenario: Month picker

- **Given** Month mode, today `2026-09-02`
- **When** the user opens the trigger and selects August 2026
- **Then** the range is `2026-08-01` through `2026-08-31`
- **And** the closed trigger shows `August 2026`

### Scenario: Manual range on one grid

- **Given** the picker is in Manual
- **When** the user clicks `2026-08-10` then `2026-08-20` on the day grid
- **Then** only txs with `occurredOn` in that inclusive range show
- **And** the closed trigger shows the formatted from–to
- **And** From and To chips sit in the same popover as the grid

### Scenario: Mode switch copy

- **Given** Month `2026-08`
- **When** the user switches to Manual
- **Then** start is `2026-08-01` and end is `2026-08-31`
- **Given** Manual start `2026-07-04` end `2026-07-20`
- **When** the user switches to Month
- **Then** the selected month is `2026-07`

## Traceability

- Vitest: calendar grid padding; trigger label; manual first/second click in `apps/web/src/lib/domain/transaction-date-range.test.ts` (141 range rules stay in `activity-filters.test.ts`)
- Playwright: `e2e/activity-filters.e2e.ts` — trigger not in header; open picker Month vs Manual; scroll chrome still visible
- Implementation: `TransactionRangePicker.svelte`; `AppShellChrome.svelte` sticky band; domain helpers

## Related

- 141 date-range domain (placement superseded); 134 Transactions; 049 xl drawer
