# Spec 076: Activity row date/note + empty-secondary chrome

- **ID:** 076
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Align Activity row secondary content with sort mode and remove empty-note spacers. Tighten single-line rows when there is nothing to show under the category.

## Scope

### In scope

1. **Default** sort (`createdAt-desc`): each Activity row shows **date** on the secondary area — if note exists, **note then date** (same pattern as Home Recent); if no note, **date alone**
2. **Date** asc/desc: keep date **group headers** (068); row secondary is **note only**; if note empty, **no secondary line and no spacer**
3. When there is **no note and no date line** on the row, render a **single-line** row with category **vertically centered** with amount/chevron (tighter height)
4. Home Recent unchanged by this spec

### Out of scope

- Pocket under amount (077)
- Changing group header behavior beyond 068
- Chunked reveal (069)

## Domain rules

- Purely presentational relative to sort mode + note emptiness
- Supersedes Spec 068’s “empty `text-xs` spacer” on Activity for date sorts

## Acceptance scenarios

### Scenario: Default shows date

- **Given** Activity Default sort and a tx with note `Coffee` on day D
- **When** the row renders
- **Then** secondary shows note and date (Recent-style)
- **And** a tx with empty note still shows the date

### Scenario: Date sort note only, no spacer

- **Given** Date descending sort and a tx with empty note
- **When** the row renders under its date header
- **Then** there is no empty secondary spacer
- **And** category is vertically centered with the amount

### Scenario: Date sort with note

- **Given** Date sort and note `Rent`
- **When** the row renders
- **Then** secondary shows `Rent` only (no per-row date)

## Traceability

- Vitest: optional secondary-mode helper if extracted
- Playwright: Default date visible; date-sort empty note has no spacer / tighter row
- Implementation: `TransactionListRow.svelte`; `ActivityTable.svelte`

## Related

- 063, 068, 077
