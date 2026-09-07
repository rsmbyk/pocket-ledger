# Spec 224: Repeating Plans

- **ID:** 224
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

A Plan can **Repeat** weekly or monthly. Each occurrence still needs accept-mode Save or Skip this occurrence before money moves. Never auto-materialize ledger rows.

## Scope

### In scope

1. **Repeat field** (edit mode, section 3) — **Once**, **Weekly (on Monday)** (weekday of current Due), **Monthly (on the 31st)** (ordinal day of Due). Labels update when Due changes. Default Once. No yearly.
2. **`monthDay`** — 1–31, taken from Due when Repeat is Monthly. Saving a new Due updates it.
3. **Advance** — after accept-mode Save or Skip: Once still gravestones (223). Weekly → `dueOn + 7` local days. Monthly → next calendar month on stored `monthDay`, else that month’s last day; a later month tries `monthDay` again (31 Jan → 28/29 Feb → 31 Mar). If the new `dueOn` is still `<= today`, the Plan stays due (catch-up on the next open of accept mode / lists) — no burst of txs.
4. **Save for next** — accept-mode footer, hidden when stored Repeat is Once. Writes current **tx info** (type, amount, pockets, category, posting date as next Due, fee, note) onto the Plan. Does not post. Does not complete this occurrence.
5. **List chips** — Weekly / Monthly word + icon on the row header; Once still has no chip. Not the full “on Monday” / “on the 31st” string.
6. **Accept mode** — Repeat remains read-only (full label, e.g. `Monthly (on the 31st)`).

### Out of scope

- Yearly, RRULE, end date / count, Pause
- Changing Repeat from accept mode
- Auto-post

## Domain rules

```ts
type PlanFrequency = 'once' | 'weekly' | 'monthly';

// LedgerPlan from 223 plus:
monthDay: number | null; // 1–31 when monthly; null otherwise
```

- `nextDueOn(dueOn, frequency, monthDay, today)` — Once: n/a (caller gravestones). Weekly: plus seven calendar days. Monthly: next month’s `monthDay` or last day of that month.
- After Save/Skip on weekly/monthly: set `dueOn` to `nextDueOn`; keep the row active.
- `monthDay` ignored unless `frequency === 'monthly'`.
- Clamp is per target month; do not persist the clamped day as the new `monthDay`.

## Acceptance scenarios

### Scenario: Weekly label follows Due

- **Given** edit mode, Due is a Monday
- **When** Repeat options render
- **Then** one option is `Weekly (on Monday)`
- **When** Due changes to a Thursday
- **Then** that option is `Weekly (on Thursday)`

### Scenario: Monthly clamp remembers 31

- **Given** a Monthly Plan with Due `2026-01-31` and `monthDay` 31
- **When** the occurrence is Saved or Skipped
- **Then** `dueOn` is `2026-02-28` (or 29 in a leap year)
- **And** `monthDay` is still 31
- **When** that February occurrence is Saved or Skipped
- **Then** `dueOn` is `2026-03-31`

### Scenario: Save does not rewrite the template

- **Given** accept mode on a Monthly expense of `1_000_000`
- **When** the user changes amount to `1_100_000` and Saves
- **Then** the posted tx is `1_100_000`
- **And** the Plan amount is still `1_000_000`
- **And** `dueOn` advanced

### Scenario: Save for next

- **Given** accept mode on a Weekly Plan
- **When** the user changes amount and activates Save for next
- **Then** no ledger tx is created
- **And** the Plan amount is the new amount
- **And** `dueOn` is unchanged
- **And** Save for next is absent when Repeat is Once

### Scenario: List chip

- **Given** a Monthly Plan
- **When** any Plan list renders the row
- **Then** the header shows a Monthly chip (word Monthly + icon)
- **And** it does not include `on the 31st`
- **And** a Once Plan has no chip

## Traceability

- Vitest: `apps/web/src/lib/domain/plan.test.ts` (nextDueOn weekly/monthly clamp); `apps/web/src/lib/application/plans.test.ts` (advance vs Save for next)
- Playwright: `e2e/plans.e2e.ts` — Repeat options; Save for next hidden on Once; chip on lists; accept Save leaves template amount
- Implementation: Repeat field; `monthDay`; accept footer Save for next; list chips

## Related

- 223, 004 (archive), 087
