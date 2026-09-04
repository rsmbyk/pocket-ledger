# Spec 177: Tx Save and Close on one row

- **ID:** 177
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add/edit transaction footer actions share one horizontal row: outline **Close** left, primary **Save** right, equal width. Labels, testids, and enablement stay 037. Voided still has Close only, full width.

## Scope

### In scope

1. Footer container is a single row (`grid-cols-2` or equivalent `flex` + `flex-1`), not `flex-col`.
2. Order: **Close** (outline, `tx-close`) left, **Save** (`tx-save`) right — same as pocket/category Cancel + Save.
3. Voided: Save hidden; Close stays full width alone.
4. Sticky reachability from 082 unchanged (both still visible without scrolling the form when content fits).

### Out of scope

- Copy; busy **Saving…**
- Void header (`tx-void`)
- 173 type tabs
- 176 other dialogs

## Domain / UI rules

- Save enablement unchanged (037): create disabled when amount digits empty; edit disabled when not dirty.
- Close still runs the unsaved guard (037).

## Acceptance scenarios

### Scenario: Add or edit

- **Given** Add or edit transaction (not voided)
- **When** the footer renders
- **Then** Close and Save share one row (Close left, Save right)
- **And** both are equal width

### Scenario: Voided

- **Given** a voided transaction
- **When** the footer renders
- **Then** only Close, full width

## Traceability

- Vitest: none
- Playwright: `e2e/pockets.e2e.ts` (or `e2e/transactions.e2e.ts`) — Close and Save bounding boxes share a row (similar y); Close left of Save
- Implementation: `apps/web/src/lib/ui/QuickAddSheet.svelte`

## Related

- 037 footer Close + Save
- 082 bottom sheet: Save/Close reachable
