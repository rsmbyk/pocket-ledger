# Spec 222: Recent note/category stack matches Transactions

- **ID:** 222
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Home Recent (and pocket-details recent), the **note** is the primary line and the **category** (with catalog icon) is the muted line underneath — the same hierarchy as Transactions (136). The per-row **date** stays after that stack.

## Scope

### In scope

1. `secondary === 'date'` left column in `TransactionListRow` (Home Recent + pocket-details recent).
2. **With note:** primary is the trimmed note; next line is category icon + name; then date.
3. **Empty note:** primary is category icon + name; then date (no empty note spacer).
4. **Uncategorized / custom / transfer** chrome matches 136 (dashed Uncategorized, catalog icon or `tag`, Transfer + arrows).
5. Pass `categoryIconSlug` into Recent and pocket-details rows.
6. Amount / pocket / chevron unchanged.

### Out of scope

- Transactions list (`secondary === 'category'`) — already 136
- Hide-amounts
- Date format (`formatOccurredOnDisplay`)
- Changing pocket-under-amount (096 / 099)

## Domain / UI rules

- Icon slugs match CategoryPicker / `CategoryIcon` / catalog `icon` field.
- `STOCK_UNCATEGORIZED_ICON` / `STOCK_CUSTOM_ICON` (`tag`) as today.
- Revises 136’s “Home Recent unchanged / category-first” and 063 / 076 / 096 left-column order for date-secondary rows.

## Acceptance scenarios

### Scenario: Note then category then date

- **Given** a Home Recent transaction with category Food and note `nites`
- **When** the row renders
- **Then** the primary line is `nites`
- **And** the next left line shows the Food catalog icon and `Food`
- **And** the date line is still present under that

### Scenario: Empty note

- **Given** a categorized expense with empty note on Home Recent
- **When** the row renders
- **Then** the left column starts with category icon + name
- **And** there is no note testid
- **And** the date line is present

### Scenario: Transfer with note

- **Given** a transfer with note `pay yourself first` on Home Recent
- **When** the row renders
- **Then** primary is `pay yourself first`
- **And** the next left line is the transfer arrows icon and `Transfer`
- **And** the date line is present

### Scenario: Pocket details recent matches

- **Given** the same transaction on a pocket details recent list
- **When** that row renders
- **Then** the note/category/date stack matches Home Recent

## Traceability

- Vitest: none (presentational; no new domain helper)
- Playwright: `e2e/polish.e2e.ts`
- Implementation: `TransactionListRow.svelte`; `AppShellChrome.svelte`; `PocketDetailsPanel.svelte`

## Related

- 063, 076, 096, 136
