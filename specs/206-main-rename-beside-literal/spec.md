# Spec 206: Default pocket can take Main beside a sibling Main

- **ID:** 206
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The default pocket can take the Main fallback even when a non-Main pocket is already named Main. Two list rows can read Main. Two **non-Main** pockets named Main still collide (201).

## Scope

`assertUniquePocketName` / `updatePocket` / Edit pocket Name. Main on the default pocket stays the unnamed fallback (`isUnsetMainName`, empty Name field). Landmark icon still from `isMain`.

Extends Spec 201 uniqueness for the default pocket taking Main. Does not change 201’s “two literal Mains collide” for create.

## Acceptance scenarios

### Scenario: Rename default back to Main

- **Given** the default pocket is named Household
- **And** a non-Main pocket is named Main
- **When** the user sets the default pocket name to Main (or clears it)
- **Then** save succeeds with no Name error
- **And** the list shows two Main labels

### Scenario: Second non-Main Main still fails

- **Given** a non-Main pocket already named Main
- **When** the user adds another pocket named Main
- **Then** save fails with an error under Name

## Traceability

- Vitest: `apps/web/src/lib/domain/account.test.ts`, `apps/web/src/lib/application/accounts.test.ts`
- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `account.ts`, `accounts.ts`
