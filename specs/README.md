# Specs

Living behavior contracts for Pocket Ledger.

## Rules

1. Spec **before** implementation for user-visible behavior or money rules.
2. Use the [template](_template.md).
3. Number specs: `000-scaffold.md`, `001-…`.
4. Keep acceptance scenarios in Given / When / Then.
5. Link Vitest and Playwright files under **Traceability**.
6. Update the spec in the same PR as behavior changes.

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
