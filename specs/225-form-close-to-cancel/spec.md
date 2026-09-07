# Spec 225: Form Close → Cancel

- **ID:** 225
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Every **form dismiss** control that currently says **Close** says **Cancel**, matching pocket/goal/category footers. Nested ConfirmDialog **Cancel** still aborts the warn (keep editing / abort Void). Icon chrome stays “Close”.

## Scope

### In scope

1. Add/edit transaction footer (`tx-close`) — visible label **Cancel**. Testid unchanged. Voided: Cancel full width (177 layout).
2. Transactions date range picker footer — **Cancel** (discards draft range, same as 143 Close).
3. Activity filters sheet (`activity-filters-close`, &lt;1280) — **Cancel**. ≥1280 always-on drawer still has no Close/Cancel (058).
4. Playwright / copy that asserted the word Close on those buttons.

### Out of scope

- ConfirmDialog `confirm-dialog-cancel` copy (stays Cancel = abort)
- Unsaved-leave title/body; Cancel / Discard / Save draft (184)
- `sr-only` Close on Dialog/Sheet X
- Sidebar trigger “Close menu”
- `dialog-footer.svelte` default unused Close (only if a host still shows it as a form dismiss)
- Reset / other action dialogs that do not use Close as form dismiss

## Domain / UI rules

- Behavior unchanged: same click path, unsaved guard, range discard, filter discard.
- 177 “Close left, Save right” becomes **Cancel** left, Save right.
- 143 Close/Escape/outside discard: label Cancel; Escape/outside unchanged.

## Acceptance scenarios

### Scenario: Tx footer

- **Given** Add or edit transaction (not voided)
- **When** the footer renders
- **Then** `tx-close` visible text is `Cancel`
- **And** it stays left of Save, equal width

### Scenario: Voided tx

- **Given** a voided transaction sheet
- **When** the footer renders
- **Then** the only footer action is `Cancel` (`tx-close`), full width

### Scenario: Range picker

- **Given** the Transactions range picker open
- **When** the footer renders
- **Then** the discard control says `Cancel`
- **And** activating it discards an un-applied draft (143)

### Scenario: Filters sheet

- **Given** Transactions at width &lt; 1280 with Filters open
- **When** the sheet footer renders
- **Then** `activity-filters-close` says `Cancel`
- **Given** width ≥ 1280
- **When** the always-on drawer renders
- **Then** `activity-filters-close` is absent

### Scenario: Unsaved-leave still Cancel

- **Given** a dirty tx sheet
- **When** the user hits Cancel on the form
- **Then** Discard unsaved changes? still offers **Cancel** (keep editing) and **Discard**

## Traceability

- Vitest: none (label)
- Playwright: `e2e/pockets.e2e.ts` / `e2e/transactions.e2e.ts` (tx-close name Cancel); `e2e/activity-filters.e2e.ts` (range Cancel; filters Cancel; xl still no close control)
- Implementation: `QuickAddSheet.svelte`; `TransactionRangePicker.svelte`; `AppShellChrome.svelte` filters sheet

## Related

- 037, 045, 058, 143, 177, 184, 223
