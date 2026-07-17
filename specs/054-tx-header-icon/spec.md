# Spec 054: Transaction header icons

- **ID:** 054
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Show a mode icon in the transaction sheet header next to the title: Plus for add, Pencil for edit, Ban for voided view.

## Scope

### In scope

1. Header title row includes an icon:
   - **Add** → Plus
   - **Edit** (non-voided) → Pencil
   - **Voided** view → Ban
2. Stable `data-testid` hooks for each mode icon

### Out of scope

- Replacing title text with icon-only
- Changing the Void **action** button (still Ban + label; Spec 053 fill)
- Confirm dialog icons (057)

## Domain rules

- None

## Acceptance scenarios

### Scenario: Add shows Plus

- **Given** the user opens Add transaction
- **When** the sheet header renders
- **Then** a Plus icon is shown with the title (`data-testid="tx-header-icon-add"`)

### Scenario: Edit shows Pencil

- **Given** the user opens a non-voided transaction for edit
- **When** the sheet header renders
- **Then** a Pencil icon is shown (`data-testid="tx-header-icon-edit"`)

### Scenario: Voided shows Ban

- **Given** the user opens a voided transaction
- **When** the sheet header renders
- **Then** a Ban icon is shown (`data-testid="tx-header-icon-voided"`)

## Traceability

- Vitest: none
- Playwright: `e2e/tx-sheet-polish.e2e.ts`
- Implementation: `src/lib/ui/QuickAddSheet.svelte`

## Related

- Spec 044 / 047 (tx sheet chrome)
