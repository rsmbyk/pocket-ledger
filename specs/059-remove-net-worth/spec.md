# Spec 059: Remove Net worth

- **ID:** 059
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Remove the Net worth snapshots feature from Pocket Ledger while keeping storage/backup compatibility for older JSON backups.

## Scope

### In scope

1. Remove More **Net worth** card (capture, chart, list)
2. Remove App wiring (`snapshots`, `captureNetWorth`, `listNetWorthSnapshots`)
3. Stop shipping application capture API usage (may delete `src/lib/application/net-worth.ts` and tests)
4. Update reset/backup user-facing copy that mentions net-worth snapshots as a product feature
5. Mark Spec 006 superseded by 059 in index/docs

### Out of scope

- Deleting the Dexie `netWorthSnapshots` table or breaking backup schema
- Multi-account true net worth later

## Domain rules

- No new domain rules
- Backup may still round-trip `netWorthSnapshots` (including `[]`)

## Acceptance scenarios

### Scenario: More has no Net worth

- **Given** the More panel
- **When** it renders
- **Then** there is no Net worth section / `capture-net-worth` control

### Scenario: Backup still works

- **Given** a backup JSON with or without `netWorthSnapshots`
- **When** the user exports or imports
- **Then** backup flow succeeds (no product UI to create new snapshots)

## Traceability

- Vitest: remove `src/lib/application/net-worth.test.ts`; keep `src/lib/application/backup.test.ts` / `reset.test.ts` green
- Playwright: remove net-worth case from `e2e/base-features.e2e.ts`; no `e2e/net-worth.e2e.ts`
- Implementation: `MorePanel.svelte`, `App.svelte`, net-worth application module

## Related

- Supersedes Spec 006
- Spec 003 (export/import keeps field)
