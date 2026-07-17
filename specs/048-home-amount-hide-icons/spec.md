# Spec 048: Home amount hide + by-category icons

- **ID:** 048
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Correct Spec 045 month-summary icon placement and deepen amount privacy: hide money without leaking sign or color, and remember the preference across reloads.

## Scope

### In scope

1. **By-category icons** — “Income by category” / “Expenses by category” titles show Income/Expense icons (same family as Categories headers)
2. **Sum tiles** — Income / Expenses / Net **total** tiles have **no** kind icons (revert 045 tile icons)
3. **Hide amounts** — when hidden, Balance, Recent amounts, Month summary totals, and chart amount labels show masked values (`••••`)
4. **Hide signs** — when hidden, do not show `+` / `−` and do not use income/expense/net sign colors on those amounts (muted)
5. **Persist** — preference stored in `localStorage` under `pocket-ledger-hide-amounts`; restored on load

### Out of scope

- Persisting Activity applied/draft filters (still session-only per 045/049)
- Changing Net color rules when amounts are **visible** (031 still applies when shown)

## Domain rules

- Default hide preference: `false` (show amounts)
- Storage key: `pocket-ledger-hide-amounts`
- Stored values: truthy string `"1"` / `"true"` → hidden; missing or other → shown
- When hidden, UI must not reveal magnitude via colored sign styling on the masked fields

## Acceptance scenarios

### Scenario: Icons on by-category, not tiles

- **Given** Home with a month summary
- **When** the card renders
- **Then** sum tiles Income/Expenses have no kind icons, and “Income by category” / “Expenses by category” titles include the kind icons

### Scenario: Hide strips signs and color

- **Given** Home with non-zero income and expense recent rows
- **When** the user hides amounts
- **Then** Balance, Recent, and month figures show masked text without `+`/`−`, and amount text is not emerald/destructive by sign

### Scenario: Preference persists

- **Given** amounts are hidden
- **When** the user reloads the app
- **Then** amounts remain hidden until shown again

## Traceability

- Vitest: `src/lib/shared/hide-amounts.test.ts`
- Playwright: `e2e/home-amounts.e2e.ts`
- Implementation: `src/lib/shared/hide-amounts.ts`, `src/lib/ui/AppShellChrome.svelte`, `src/lib/ui/MonthSummary.svelte`, `src/lib/ui/CategoryBreakdownChart.svelte`

## Supersedes

- Spec 045 § In scope items 2–3 (tile icons; session-only hide) and related “session only” / out-of-scope persistence bullets for **amount hide only**
