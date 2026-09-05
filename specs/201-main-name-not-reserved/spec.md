# Spec 201: Main is a fallback, not a reserved name

- **ID:** 201
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

**Main** is the display fallback when the default pocket has no custom name. A second pocket may be literally named Main. Two list rows can read Main: the unnamed default (bank icon) and a custom pocket named Main.

## Scope

`normalizePocketNameInput` / `assertUniquePocketName`, create/update pocket, Name field error. Landmark icon still from `isMain`.

Supersedes Spec 197 reserved-Main rule only. Unique custom names stay. Default pocket taking Main beside a sibling Main: [206](../206-main-rename-beside-literal/spec.md).

## Acceptance scenarios

### Scenario: Literal Main allowed

- **Given** the default pocket uses the Main fallback
- **When** the user adds a pocket named Main
- **Then** save succeeds
- **And** the list shows two Main labels
- **And** there is no Name field error

### Scenario: Custom duplicates still fail

- **Given** a pocket named Daily
- **When** the user adds another Daily
- **Then** save fails with an error under Name

### Scenario: Two literal Mains collide

- **Given** a non-Main pocket already named Main
- **When** the user adds another pocket named Main
- **Then** save fails with an error under Name

## Traceability

- Vitest: `apps/web/src/lib/domain/account.test.ts`, `apps/web/src/lib/application/accounts.test.ts`
- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `account.ts`, `accounts.ts`
