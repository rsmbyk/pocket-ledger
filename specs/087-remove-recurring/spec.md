# Spec 087: Remove recurring

- **ID:** 087
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Remove the **recurring** feature from the live product: UI, application, domain, storage path, and docs pointers.

## Scope

### In scope

1. Remove More Recurring section and all create / toggle / delete UI
2. Remove shell/App wiring and props for recurring
3. Remove `application/recurring`, `domain/recurring*`, `data/recurring-repo`, and their tests
4. Dexie: clear/drop `recurringRules` on schema bump; stop reading/writing it in app code
5. Backup export: do not include recurring; import: ignore legacy recurring without failing
6. Reset flows: no recurring handling beyond clearing leftover table if present
7. Update `docs/PRODUCT.md` / `DATA_MODEL` / roadmap as needed; leave historical `specs/004-recurring.md` as archive

### Out of scope

- New scheduler / reminder replacement
- Rewriting old Accepted specs in place

## Acceptance scenarios

### Scenario: No Recurring in More

- **Given** More panel
- **When** it renders
- **Then** there is no Recurring section or recurring controls

### Scenario: Import old backup

- **Given** a backup JSON that still contains recurring rules
- **When** the user imports
- **Then** import succeeds and recurring data is not shown or used

## Traceability

- Remove/adjust `e2e/base-features.e2e.ts` (and any recurring-only e2e)
- Vitest: backup import with legacy recurring key
- Implementation: MorePanel, AppShell*, db, backup, reset, docs

## Related

- 004 (archive), 008, 024
