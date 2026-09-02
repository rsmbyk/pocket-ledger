# Spec 143: Range picker Apply, Close, and To-hover preview

- **ID:** 143
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Opening the Transactions date popover copies the committed range into a draft. The closed trigger and the list stay on the committed range until **Apply**. **Close**, Escape, and outside click discard the draft. While picking To, hovering a day paints the From–hover span on the calendar (not the list).

## Scope

### In scope

1. **Draft** — on open, copy committed `range` into local draft. Month/Manual UI, mode switch, and day/month clicks edit draft only.
2. **Apply** (`activity-range-apply`) — commit draft via `onRangeChange`, then close.
3. **Close** (`activity-range-close`) — drop draft and close. Same path as Escape and interact-outside.
4. **Trigger / list** — `formatRangeTriggerLabel` and list filtering use the **committed** range until Apply.
5. **Month** — selecting a month highlights it in the 12-grid from draft; does **not** close or commit.
6. **Manual** — `applyManualDayPick` on draft. List does not filter until Apply.
7. **Mode switch** — 141 mapping (Month→Manual keeps bounds; Manual→Month snaps to month of start) on **draft**.
8. **To hover preview** — when picking To, `pointerenter` a day highlights From→that day (snap if reversed) with the same endpoint/`bg-muted` chrome as the draft range. Leaving the day grid clears the hover. Click still sets To. No list update on hover. Touch: no hover; second tap sets To.
9. **Footer** — outline Close + primary Apply on both Month and Manual interiors. Popover width unchanged (`w-[18.5rem]`).

### Out of scope

- 141 session shape; Filters From/To; Clear resetting the range
- Sticky chrome band / header (142)
- Third-party calendar widget
- Playwright assertion of hover classes (manual / optional)

## Domain rules

- Commit still uses 141/142 helpers (`rangeFromMonthKey`, `rangeFromCustom` / snap, `monthRangeToCustom`, `customRangeToMonth`).
- Hover highlight bounds are `snapDateRange(draft.startDate, hoverIso)` while picking To.

## Acceptance scenarios

### Scenario: Month pick does not commit until Apply

- **Given** Month mode, today `2026-09-02`, committed range current month
- **When** the user opens the picker and selects August 2026 without Apply
- **Then** the closed trigger still shows `September 2026` (or the previous committed label if the popover is still open, the trigger is unchanged)
- **When** they click Apply
- **Then** the trigger shows `August 2026` and the list uses `2026-08-01` through `2026-08-31`

### Scenario: Close discards Manual draft

- **Given** a committed month range
- **When** the user switches to Manual, picks days, then Close (or Escape / outside)
- **Then** the trigger and list still match the committed month range

### Scenario: Apply commits Manual

- **Given** Manual draft `2026-08-10`–`2026-08-20`
- **When** the user clicks Apply
- **Then** only txs with `occurredOn` in that inclusive range show
- **And** the closed trigger shows the formatted from–to

### Scenario: To hover previews the span

- **Given** picking To after From `2026-08-10`
- **When** the pointer is over `2026-08-20`
- **Then** the grid highlights `10`–`20` (and snaps if the hover day is before From)
- **And** the Transactions list is unchanged

## Traceability

- Vitest: hover/snap highlight bounds in `apps/web/src/lib/domain/transaction-date-range.test.ts`
- Playwright: `e2e/activity-filters.e2e.ts` — month without Apply; Apply commits; Close/Escape discard Manual
- Implementation: `TransactionRangePicker.svelte`

## Related

- 142 picker + chrome (live-apply superseded); 141 domain
