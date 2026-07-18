# Spec 074: Accounts → Pockets copy + docs

- **ID:** 074
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Align product copy and living docs with **Pockets** while keeping storage table `accounts` and documenting the synonym for backups.

## Scope

### In scope

1. Update [`docs/PRODUCT.md`](../../docs/PRODUCT.md): multi-pocket UX; Main; router includes Pockets; goals on pockets; transfers
2. Update [`docs/DATA_MODEL.md`](../../docs/DATA_MODEL.md) / [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) for new account fields and transfer usage
3. User-visible labels: prefer **Pocket** / **Pockets** / **Pots** (short) over Account where the UI still says Account
4. Backup/export notes: JSON may still use `accounts`; UI calls them Pockets

### Out of scope

- Renaming IndexedDB object store
- Changing export schema key from `accounts` (compat)

## Domain rules

- None beyond documentation/copy consistency

## Acceptance scenarios

### Scenario: PRODUCT reflects Pockets

- **Given** PRODUCT.md after this slice
- **When** a reader checks accounts/router/goals
- **Then** it describes Pockets nav, Main, pocket goals, and transfers at a high level

### Scenario: No stray Account hub label

- **Given** the Pockets panel and nav
- **When** the user views chrome
- **Then** the hub is labeled Pockets (not Accounts)

## Traceability

- Vitest: n/a (docs) unless small copy constants tested
- Playwright: nav/panel accessible name “Pockets”
- Implementation: docs + UI strings

## Related

- 070–073, 075
