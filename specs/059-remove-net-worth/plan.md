# Plan 059: Remove Net worth

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Net worth snapshots only duplicated Main balance as manual history. Ronald does not want the feature.

## Scope / edges

**In:** Remove UI, app capture/list wiring, unit/e2e for capture. Mark Spec 006 superseded.

**Keep:** Dexie `netWorthSnapshots` table + backup import/export field for old backups.

## Approach

- Strip More card + App.svelte props/loads
- Delete or gut `application/net-worth.ts` usage; remove `net-worth.test.ts` capture tests
- Update reset copy; PRODUCT/ROADMAP/README notes

## TDD

- Remove net-worth Playwright; keep backup/reset green with empty or legacy snapshots
