# Specs

Living behavior contracts for Pocket Ledger.

## Rules

1. Spec **before** implementation for user-visible behavior or money rules.
2. Use the [template](_template.md).
3. Number specs: `000-scaffold.md`, `001-…`.
4. Keep acceptance scenarios in Given / When / Then.
5. Link Vitest and Playwright files under **Traceability**.
6. Update the spec in the same PR as behavior changes.
7. **One concern per spec** — do not mix **unrelated** features in one numbered spec. A single UI surface redesign (e.g. one modal or one menu) may be one spec with multiple acceptance scenarios.

## Index

| Spec | Title | Status |
|------|-------|--------|
| [000](000-scaffold.md) | Scaffold shell, theme, PWA, default account | Accepted |
| [001](001-transactions.md) | Transactions + seed categories | Accepted |
| [002](002-month-charts.md) | Month summary + charts | Accepted |
| [003](003-export-import.md) | Export & import JSON backup | Accepted |
| [004](004-recurring.md) | Recurring transactions | Accepted |
| [005](005-goals.md) | Goals | Accepted |
| [006](006-net-worth.md) | Net worth snapshots | Accepted |
| [007](007-passphrase-lock.md) | Optional passphrase lock | Accepted |
| [008](008-more-tab.md) | More tab hub | Accepted |
| [009](009-router.md) | Hash router for shell panels | Accepted |
| [010](010-custom-categories.md) | Custom category management | Accepted |
| [011](011-field-encryption.md) | Field-level at-rest encryption | Accepted |
| [012](012-polish.md) | Polish: edit/delete tx + empty states | Accepted |
| [013](013-desktop-layout.md) | Desktop-first shell (responsive drawer on mobile) | Accepted |
| [014](014-void-transactions.md) | Void transactions (replace hard delete) | Accepted |
| [015](015-destructive-confirms.md) | Destructive danger buttons + confirms | Accepted |
| [016](016-activity-balance.md) | Remove Activity compact balance | Accepted |
| [017](017-activity-filters.md) | Activity filters + search | Accepted |
| [018](018-categories-add-modal.md) | Categories add per-kind modal | Accepted |
| [019](019-drawer-trigger-morph.md) | Drawer trigger morphing panel icon | Accepted |
| [020](020-activity-filters-mobile.md) | Activity filters mobile compact layout | Accepted |
| [021](021-categories-panel-order.md) | Categories Income first + right-aligned actions | Accepted |
| [022](022-categories-icon-actions.md) | Categories icon-only row actions | Accepted |
| [023](023-recent-empty-notes.md) | Recent empty notes (no type filler) | Accepted |
| [024](024-reset-all.md) | Reset everything (More) | Accepted |
| [025](025-no-seed-categories.md) | No automatic seed categories | Accepted |
| [026](026-recent-short-dates.md) | Recent short date display | Accepted |
| [027](027-uncategorized-transactions.md) | Uncategorized transactions | Accepted |
| [028](028-month-summary-dividers.md) | Month summary section dividers | Accepted |
| [029](029-more-single-column.md) | More panel one card per row | Accepted |
| [030](030-remove-void-label.md) | Remove Void label from lists | Accepted |
| [031](031-month-net-sign-color.md) | Month summary Net sign coloring | Draft |
| [032](032-list-empty-states.md) | List empty states (no CTAs) | Draft |
| [034](034-category-save-emphasis.md) | Emphasize active category save | Draft |
| [035](035-filters-icon-button.md) | Icon-only Activity Filters button | Draft |
| [036](036-activity-form-short-dates.md) | Short dates on Activity and tx form | Draft |
| [037](037-transaction-sheet.md) | Transaction sheet redesign | Draft |
| [038](038-categories-menu.md) | Categories menu redesign | Draft |
