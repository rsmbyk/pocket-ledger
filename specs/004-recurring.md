# Spec 004: Recurring transactions

- **ID:** 004
- **Status:** Accepted

## Intent

Support repeating income/expense templates that spawn ledger transactions when due (local dates, offline).

## Scope

### In scope

- Create recurring rule: type, amount, category, note, frequency (`weekly` | `monthly`), start/next date
- On app open (and after add), materialize any due occurrences up to today
- List active rules on More; pause/delete rule
- Spawned transactions are normal ledger rows

### Out of scope

- Custom RRULE / complex calendars
- End date / occurrence count
- Editing past spawned rows as a series

## Domain rules

- Frequency weekly → next = +7 days; monthly → same day next month (clamp to month end)
- Materialize while `nextOccurredOn <= today` and rule `active`
- Each spawn uses rule amount/type/category/account; then advance `nextOccurredOn`

## Acceptance scenarios

### Scenario: Monthly rule creates a transaction when due

- **Given** an active monthly expense rule with `nextOccurredOn` today or earlier
- **When** the app runs due materialization
- **Then** a matching expense exists and the rule’s next date advances

## Traceability

- Vitest: `src/lib/domain/recurring.test.ts`, `src/lib/application/recurring.test.ts`
- Playwright: `e2e/recurring.e2e.ts`
- Implementation: `src/lib/application/recurring.ts`
