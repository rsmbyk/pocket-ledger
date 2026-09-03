# Spec 165: Reset keep-option helpers

- **ID:** 165
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Reset confirm spells out what each keep-checkbox preserves. Behavior stays 159.

## Scope

### In scope

1. Helper under **Keep settings** (`reset-preserve-settings-hint`): **Display currency, idle minutes, and lock when you leave this tab.**
2. Helper under **Keep passphrase** when lock is on (`reset-preserve-passphrase-hint`): **Device lock on this browser.**
3. Checkboxes stay named **Keep settings** / **Keep passphrase**. Keys preserved stay 159.

### Out of scope

- Merging flags; renaming the checkboxes; theme mention; changing which keys are preserved

## Domain / UI rules

- Helpers are muted supporting text, not a second checkbox.
- Keep passphrase (and its hint) still only render when device lock is on.

## Acceptance scenarios

### Scenario: Keep settings helper, lock off

- **Given** the Reset confirm is open, lock off
- **When** `reset-preserve-settings` is shown
- **Then** helper text names display currency, idle minutes, and leave-this-tab lock
- **And** there is no Keep passphrase row (159)

### Scenario: Keep passphrase helper, lock on

- **Given** lock on
- **When** the confirm opens
- **Then** Keep passphrase has helper copy that it is device lock on this browser
- **And** both checkboxes still default unchecked; keys preserved are unchanged (159)

## Traceability

- Vitest: none (preserve keys already in `reset.test.ts`)
- Playwright: `e2e/reset.e2e.ts` — keep-settings hint visible on confirm
- Implementation: Reset dialog in `MorePanel.svelte`

## Related

- 159 Settings reset keep-options
