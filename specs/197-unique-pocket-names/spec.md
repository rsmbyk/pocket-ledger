# Spec 197: Unique pocket names; Main is the default label

- **ID:** 197
- **Status:** Accepted — reserved Main superseded by [201](../201-main-name-not-reserved/spec.md)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Pocket names are unique (case-insensitive, trim, collapse spaces). **Main** is the default label for the default pocket when no custom name is set — not a name typed into the field. Reserved-Main for other pockets is superseded by [201](../201-main-name-not-reserved/spec.md).

## Scope

`createPocket` / `updatePocket`, pocket form Name field. Landmark icon still from `isMain`.

## Acceptance scenarios

### Scenario: Duplicate rejected

- **Given** a pocket named Daily
- **When** the user adds another Daily
- **Then** save fails with an error under Name

### Scenario: Main field is empty

- **Given** the default pocket still uses the Main fallback
- **When** Edit pocket opens
- **Then** Name is empty with placeholder Main
- **And** saving empty keeps displaying Main

### Scenario: Custom Main name

- **Given** Edit Main
- **When** the user saves Household
- **Then** the list shows Household
- **And** clearing Name and saving restores the Main fallback

## Traceability

- Vitest: `apps/web/src/lib/domain/account.test.ts`, `apps/web/src/lib/application/accounts.test.ts`
- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `account.ts`, `accounts.ts`, `PocketsPanel.svelte`
