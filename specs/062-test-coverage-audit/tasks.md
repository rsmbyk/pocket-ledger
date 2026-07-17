# Tasks 062: Codebase test coverage audit

- **Status:** Accepted
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
| domain/goals | goals.test.ts | covered (060) |
| domain/occurred-on-display | occurred-on-display.test.ts | covered |
| domain/account | — | defer (type-only constants via accounts app) |
| domain/transaction | — | covered via rules/transactions app |
| domain/net-worth | type + repo only | storage kept; app API removed (059) |
| application/accounts | accounts.test.ts | filled |
| application/transactions | transactions.test.ts | covered |
| application/categories | categories.test.ts | covered |
| application/month-summary | month-summary.test.ts | filled |
| application/recurring | recurring.test.ts | covered |
| application/goals | goals.test.ts | covered (060) |
| application/backup | backup.test.ts | covered |
| application/reset | reset.test.ts | covered |
| application/lock | lock.test.ts | covered |
| application/field-crypto | field-crypto.test.ts | covered |
| application/net-worth | removed (059) | removed |
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
| Recurring | base-features | covered |
| Goals | goals.e2e.ts | filled (060) |
| Net worth | removed in base-features | removed (059) |
| More chrome icons | base-features sections | covered (061) |

## Checklist

- [x] Spec Accepted by Ronald
- [x] Complete matrix (mark covered / filled / deferred)
- [x] Add `src/lib/application/accounts.test.ts`
- [x] Add `src/lib/application/month-summary.test.ts` (or domain-only deferral with reason)
- [x] Ensure 059/060/061 test updates land
- [x] `npm run check`
- [x] `npm run test:unit:run`
- [x] `npm run test:e2e`
- [x] Traceability / matrix checked off in this file
