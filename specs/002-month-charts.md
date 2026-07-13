# Spec 002: Month summary + charts

- **ID:** 002
- **Status:** Accepted

## Intent

Give a clear picture of the selected calendar month: income vs spending, net, and where expenses went — with simple charts on Home.

## Scope

### In scope

- Month navigation (previous / next), default = current local month (`YYYY-MM`)
- Month totals: income, expense, net (income − expense)
- Cashflow chart: income vs expense for the month (bar comparison)
- Expense breakdown chart: totals by category for expenses in the month
- Show charts on the Home tab under the balance card
- Pure client aggregation from existing transactions (no new storage)

### Out of scope

- Multi-month trend lines / year views
- Income category breakdown
- Editing transactions from chart clicks
- Heatmaps
- External chart CDN (keep offline-friendly; SVG in-app)

## Domain rules

- A transaction belongs to month `M` iff `occurredOn` starts with `YYYY-MM`
- Month income = sum of `amountMinor` where `type === 'income'`
- Month expense = sum of `amountMinor` where `type === 'expense'`
- Month net = income − expense
- Category breakdown only includes expenses with a `categoryId`; missing category → “Uncategorized”
- Empty month → zeros and empty breakdown (charts still render in empty state)

## Acceptance scenarios

### Scenario: Empty month shows zero totals

- **Given** the user is on a month with no transactions
- **When** Home is visible
- **Then** month income, expense, and net show zero for that month

### Scenario: Month totals reflect income and expense

- **Given** transactions in July 2026: income 100000 and expense 15000 (Food)
- **When** the user views July 2026
- **Then** income is 100000, expense is 15000, net is 85000

### Scenario: Expense breakdown lists categories

- **Given** July 2026 expenses in Food and Transport
- **When** the user views that month’s breakdown
- **Then** both categories appear with their totals

### Scenario: Month navigation changes the summary

- **Given** Home shows the current month
- **When** the user taps previous month
- **Then** the month label and totals update to the previous calendar month

## Traceability

- Vitest: `src/lib/domain/month-summary.test.ts`
- Playwright: `e2e/month-charts.e2e.ts`
- Implementation: `src/lib/domain/month-summary.ts`, `src/lib/application/month-summary.ts`, `src/lib/ui/MonthSummary.svelte`
