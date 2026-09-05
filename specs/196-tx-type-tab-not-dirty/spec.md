# Spec 196: Type tabs are not dirty

- **ID:** 196
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Add transaction, switching Income / Transfer / Expense with otherwise default fields is not dirty. Close does not open discard.

## Scope

`isCreateTxDirty` (omit type). Amount, category, note, date, pocket, fee still dirty. Edit type tabs stay locked.

## Acceptance scenarios

### Scenario: Tabs then Close

- **Given** Add transaction at defaults
- **When** the user switches Transfer then Income and Close
- **Then** the sheet closes with no discard confirm

## Traceability

- Vitest: `apps/web/src/lib/domain/transaction-rules.test.ts`
- Playwright: `e2e/create-form-drafts.e2e.ts`
- Implementation: `transaction-rules.ts`
