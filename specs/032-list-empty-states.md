# Spec 032: List empty states (no CTAs)

- **ID:** 032
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Replace bare empty copy and CTA buttons with designed empty views. No buttons inside empty views.

## Scope

### In scope

- **Recent:** `data-testid="recent-empty"` — title **No recent activity**, support **Transactions you add will show up here.**; remove `home-empty` / `home-empty-add`; card header Add stays
- **Activity — no txs:** `data-testid="activity-empty"` — title **No transactions yet**, support **Your ledger is empty for now.**; remove empty CTA
- **Activity — filtered empty:** when ledger has txs but filters/search match none — `data-testid="activity-empty-filtered"` — title **No matching transactions**, support **Try clearing filters or search.**
- **Categories Income:** `data-testid="category-empty-income"` — distinct empty (icon + title **No income categories**, support **Labels for money coming in.**)
- **Categories Expense:** `data-testid="category-empty-expense"` — distinct empty (icon + title **No expense categories**, support **Labels for money going out.**)
- Shared pattern: centered icon, title, one supporting sentence; design-system tokens only

### Out of scope

- Month chart empties
- Spec 038 card chrome / reorder (may share icons later)

## Domain rules

- None (presentation). Activity needs `totalCount` vs filtered list length.

## Acceptance scenarios

### Scenario: Recent empty

- **Given** no transactions
- **When** Home Recent renders
- **Then** `recent-empty` is shown with no button inside it

### Scenario: Activity filtered empty

- **Given** at least one transaction and filters that match none
- **When** Activity list renders
- **Then** `activity-empty-filtered` is shown, not the “no transactions yet” empty

### Scenario: Categories kind empties differ

- **Given** no income categories and some expense categories (or vice versa)
- **When** Categories renders
- **Then** only the empty kind shows its kind-specific empty view

## Traceability

- Vitest: n/a
- Playwright: polish / activity-filters / categories; update `e2e/nav.ts` openAdd (no empty-add buttons)
- Implementation: `AppShellChrome.svelte`, `ActivityTable.svelte`, `CategoriesPanel.svelte`, optional `EmptyState.svelte`
- Depends on: 013, 017, 021
