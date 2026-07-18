# Plan 075: Activity filter by pocket

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070

## Why

Activity needs to focus on one pot without scoping Home.

## Scope / edges

**In:** Filter control All + each pocket (070 order + Main icon); Apply/Clear with existing draft/applied pattern; transfers match if source or dest selected.

**Out:** Multi-select pockets; Home scoping.

## Approach

- Extend `ActivityFilterCriteria` with `pocketId: 'all' | string`
- `filterTransactions`: if not all, keep tx where `accountId === id` OR (`type === 'transfer'` && `counterAccountId === id`)
- UI in filters drawer/sheet; badge count includes pocket when not All

## TDD

- Filter helper cases for income/expense/transfer
