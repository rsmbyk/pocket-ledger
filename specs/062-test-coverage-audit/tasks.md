# Tasks 062: Codebase test coverage audit

- **Status:** Draft (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Module matrix (fill during implement)

| Module | Test file | Status |
|--------|-----------|--------|
| domain/money | money.test.ts | covered |
| domain/categories | categories.test.ts | covered |
| domain/category-order | category-order.test.ts | covered |
| domain/activity-filters | activity-filters.test.ts | covered |
| domain/month-summary | month-summary.test.ts | covered |
| domain/transaction-rules | transaction-rules.test.ts | covered |
| domain/recurring | recurring.test.ts | covered |
| domain/goals | goals.test.ts | extend in 060 |
| domain/occurred-on-display | occurred-on-display.test.ts | covered |
| domain/account | — | defer if type-only / or add smoke |
| domain/transaction | — | covered via rules/transactions app |
| domain/net-worth | — | remove with 059 |
| application/accounts | **GAP** → accounts.test.ts | todo |
| application/transactions | transactions.test.ts | covered |
| application/categories | categories.test.ts | covered |
| application/month-summary | **GAP** → month-summary.test.ts | todo |
| application/recurring | recurring.test.ts | covered |
| application/goals | goals.test.ts | extend in 060 |
| application/backup | backup.test.ts | covered |
| application/reset | reset.test.ts | covered |
| application/lock | lock.test.ts | covered |
| application/field-crypto | field-crypto.test.ts | covered |
| application/net-worth | remove with 059 | todo |
| shared/router | router.test.ts | covered |
| shared/theme | theme.test.ts | covered |
| shared/hide-amounts | hide-amounts.test.ts | covered |

## Feature → Playwright matrix

| Feature | E2E | Status |
|---------|-----|--------|
| Scaffold / shell | scaffold.e2e.ts | covered |
| Transactions / void | transactions / polish | covered |
| Categories | categories.e2e.ts | covered |
| Activity filters | activity-filters.e2e.ts | covered |
| Month charts | month-charts.e2e.ts | covered |
| Router | router.e2e.ts | covered |
| Desktop layout | desktop-layout.e2e.ts | covered |
| Home amounts | home-amounts.e2e.ts | covered |
| Encryption / lock | encryption + base-features | covered |
| Backup export | base-features | covered |
| Reset | reset.e2e.ts | covered |
| Recurring | base-features | covered (extend if thin) |
| Goals | **GAP** → goals.e2e.ts (060) | todo |
| Net worth | remove (059) | todo |
| More chrome icons | 061 | todo |

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Complete matrix (mark covered / filled / deferred)
- [ ] Add `src/lib/application/accounts.test.ts`
- [ ] Add `src/lib/application/month-summary.test.ts` (or domain-only deferral with reason)
- [ ] Ensure 059/060/061 test updates land
- [ ] `npm run check`
- [ ] `npm run test:unit:run`
- [ ] `npm run test:e2e`
- [ ] Traceability / matrix checked off in this file
