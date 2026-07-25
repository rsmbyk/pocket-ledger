# Spec 103: Modal first-input autofocus

- **ID:** 103
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When a Dialog or Sheet opens, automatically focus the first enabled text-entry field inside that panel so the user can start typing immediately.

## Scope

### In scope

1. Shared **Dialog** and **Sheet** content autofocus on open
2. **First input** = first enabled, visible **text** control only:
   - `input` typing types (`text`, `password`, `search`, `email`, `tel`, `url`, `number`, unset, and similar non-skipped types)
   - `textarea`
3. **Skip (do not autofocus):** native `select`, disabled, readonly, `checkbox` / `radio` / `button` / `submit` / `reset` / `file` / `hidden` / `image`, `type="date"` (and other non-typing date/time/range/color types), tab triggers, dropdown triggers, Close/X, confirm actions
4. If none match → leave bits-ui default focus **unless** that default would land on a non-text form control (`select`, checkbox, date, …); in that case focus the panel content instead
5. ConfirmDialog with no text fields stays on default button focus inside the confirm panel

### Out of scope

- Changing field order or copy
- Focus restore on close beyond bits-ui defaults
- Suppressing mobile virtual keyboard (autofocus on text fields is intentional)
- Command palette / sidebar special cases beyond shared Sheet.Content behavior

## Domain rules

- None (presentation / a11y chrome)

## Acceptance scenarios

### Scenario: Add transaction focuses Amount

- **Given** the home panel
- **When** the user opens Add transaction
- **Then** the Amount field (`tx-amount`) is focused (not mode tabs or type buttons)

### Scenario: Add category focuses name

- **Given** the Categories panel
- **When** the user opens Add expense (or income) category
- **Then** the category name input is focused

### Scenario: Add pocket focuses name

- **Given** the Pockets panel
- **When** the user opens Add pocket
- **Then** the pocket name input is focused

### Scenario: Show money focuses passphrase

- **Given** amounts are hidden and passphrase lock is enabled
- **When** the user opens Show money
- **Then** the passphrase input is focused

### Scenario: ConfirmDialog without text fields

- **Given** an open transaction sheet and a void confirm
- **When** the ConfirmDialog opens
- **Then** focus stays inside the confirm dialog (Cancel or Confirm), not on a parent sheet text field

### Scenario: Filters sheet does not autofocus select

- **Given** Activity on a viewport that uses the filters sheet (no enabled text fields ahead of selects)
- **When** the user opens Filters
- **Then** the Type select (`activity-filter-type`) is **not** focused; focus stays on the sheet panel (or a button), not a non-text form control

## Traceability

- Vitest: `src/lib/ui/focus-first-text-field.svelte.test.ts`
- Playwright: `e2e/modal-focus.e2e.ts`
- Implementation: `src/lib/ui/focus-first-text-field.ts`; `src/lib/components/ui/dialog/dialog-content.svelte`; `src/lib/components/ui/sheet/sheet-content.svelte`
- Depends on: 041
