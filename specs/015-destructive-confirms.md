# Spec 015: Destructive danger buttons + confirms

- **ID:** 015
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Make irreversible or data-destroying actions visually and interactively consistent: danger styling plus an explicit warning before they run.

## Scope

### In scope

- Button `variant="destructive"` for:
  - Void transaction (confirm copy: void is permanent)
  - Delete category
  - Delete recurring rule
  - Delete goal
  - Disable lock
  - Import backup control affordance where a button is shown (file input path keeps replace warning)
- `window.confirm` (or equivalent) warning before each of those actions
- Strengthen import confirm copy if needed (“replaces all local data”)

### Out of scope

- New AlertDialog / custom modal confirm system
- Pause/Resume recurring (not destructive)
- Void domain rules (spec 014)
- Categories add UX (spec 018)

## Domain rules

- No new domain rules; confirms are UI-only gates before existing use cases

## Acceptance scenarios

### Scenario: Delete category warns

- **Given** an unused custom category
- **When** the user clicks Delete
- **Then** a confirm warns the action; cancel leaves the category; accept removes it
- **And** the Delete control uses destructive styling

### Scenario: Import warns replace

- **Given** the More backup section
- **When** the user chooses an import file
- **Then** a confirm warns that import replaces all local data before restore runs

### Scenario: Disable lock warns

- **Given** lock is on
- **When** the user starts Disable lock
- **Then** a confirm warns before passphrase submission proceeds
- **And** the control uses destructive styling

### Scenario: Void confirm (after 014)

- **Given** an editable transaction
- **When** the user clicks Void
- **Then** confirm states void is permanent; cancel leaves the tx active

## Traceability

- Playwright: extend `e2e/categories.e2e.ts`, `e2e/base-features.e2e.ts`, `e2e/polish.e2e.ts` as needed (accept dialogs)
- Implementation: `QuickAddSheet.svelte`, `CategoriesPanel.svelte`, `MorePanel.svelte`
- Depends on: spec 014 for Void control existence
