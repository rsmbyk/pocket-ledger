# Spec 136: Transactions row note primary + category icon

- **ID:** 136
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Transactions list rows, the **note** is the primary line and the **category** (with catalog icon) is the muted secondary line. Home Recent is unchanged.

## Scope

### In scope

1. Transactions list only (`activity-row-*` / `ActivityTable` → `TransactionListRow`).
2. **With note:** primary is the trimmed note; secondary is category icon + name.
3. **Empty note:** category + icon is the only left line (no empty title, no spacer).
4. **Uncategorized:** `circle-dashed` + Uncategorized (existing system chrome).
5. **Custom category:** catalog icon slug, else `tag`.
6. **Transfer:** note primary when present; secondary is Transfer + arrows icon (not a category icon). Empty note → Transfer as the only left line.
7. After 134: no per-row date (date lives on the group header).
8. Amount / pocket / chevron placement unchanged (amount **string** is 137).

### Out of scope

- Home Recent (076: category primary, note then date)
- Changing pocket under amount (077 / 096)
- Filter chrome

## Domain / UI rules

- Icon slugs match CategoryPicker / `CategoryIcon` / catalog `icon` field.
- `STOCK_UNCATEGORIZED_ICON` / `STOCK_CUSTOM_ICON` (`tag`) as today.

## Acceptance scenarios

### Scenario: Note then category with icon

- **Given** a Transactions row with category YouTube and note `PLN token`
- **When** the row renders
- **Then** the primary line is `PLN token`
- **And** the secondary line shows the YouTube catalog icon and `YouTube`

### Scenario: Empty note

- **Given** a categorized expense with empty note
- **When** the row renders
- **Then** the left column is a single line: category icon + name
- **And** there is no empty note spacer

### Scenario: Transfer with note

- **Given** a transfer with note `pay yourself first`
- **When** the row renders
- **Then** primary is `pay yourself first`
- **And** secondary is the transfer arrows icon and `Transfer`

### Scenario: Home Recent unchanged

- **Given** the same tx on Home Recent
- **When** Recent renders
- **Then** category remains the primary line (076)

## Traceability

- Vitest: optional if a pure left-column helper is extracted
- Playwright: `e2e/activity-filters.e2e.ts` or list e2e — note before category; icon present; Recent still category-first
- Implementation: `TransactionListRow.svelte`; `ActivityTable.svelte` (pass icon slug)
- Related: 063, 076, 123

## Related

- 134 (no per-row date); 137 amounts
