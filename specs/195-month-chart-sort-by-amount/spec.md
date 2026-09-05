# Spec 195: Month charts sort by amount

- **ID:** 195
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Month Income and Expenses charts list user categories by amount, largest first. Admin Fee then Uncategorized stay at the bottom regardless of amount.

Supersedes Spec 043 / 106 chart order for month breakdowns only.

## Scope

`categoryTotals` in `month-summary.ts` (Home and pocket-details). Not Categories menu or Activity filters.

## Acceptance scenarios

### Scenario: Amount order with pinned system rows

- **Given** expenses Alpha 50k, Beta 5k, Uncategorized 1k, Admin Fee 250
- **When** the month summary is built
- **Then** expense breakdown order is Alpha, Beta, Admin Fee, Uncategorized

## Traceability

- Vitest: `apps/web/src/lib/domain/month-summary.test.ts`
- Implementation: `month-summary.ts`
