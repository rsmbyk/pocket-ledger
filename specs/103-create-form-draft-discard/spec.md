# Spec 103: Create-form draft on discard (session)

- **ID:** 103
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **create** flows only, when the user discards a dirty form, offer **Save draft** so the values can be restored the next time that same create window opens. Restored drafts are treated as dirty against clean create defaults, so the discard prompt still appears even with no further edits. Drafts live in `sessionStorage` for the tab session only.

## Scope

### In scope

1. **Create surfaces:** Add transaction (Normal + Transfer), Add pocket, Add category (Income and Expense)
2. **Three-action discard (create only):** Cancel (keep editing), Discard (close + clear draft), Save draft (write sessionStorage + close)
3. **Restore on open:** if a draft exists for that create identity, hydrate the form; baseline remains clean create defaults → dirty
4. **Clear draft** on Discard or successful create
5. **Pocket/category create:** add prevent-then-warn dirty dismiss (same contract as Spec 080/085 for tx), then the three-action dialog
6. Shared session helper with injectable `Storage`; malformed JSON → no draft

### Out of scope

- Edit flows (no draft read/write; edit discard stays two-button)
- Activity filters drafts
- `localStorage` / IndexedDB / cross-session persistence
- Auto-save while typing
- Cross-tab draft sync beyond normal `sessionStorage` per-tab behavior

## Domain / storage rules

- Backend: `sessionStorage` only
- Keys:
  - `pocket-ledger-draft-tx-create` — includes mode (`normal` | `transfer`) and all create fields
  - `pocket-ledger-draft-pocket-create`
  - `pocket-ledger-draft-category-create-income` / `pocket-ledger-draft-category-create-expense`
- Missing / malformed / non-object → treat as no draft
- Do not restore drafts into edit
- Restore dirty contract: compare hydrated values to clean create baseline (not to the draft itself)

## Acceptance scenarios

### Scenario: Save draft and restore dirty (tx create)

- **Given** Add transaction is dirty
- **When** the user dismisses and chooses Save draft
- **Then** the sheet closes
- **And** reopening Add transaction restores the saved fields (including mode)
- **And** dismissing again without further edits shows the discard confirm (form is dirty)

### Scenario: Discard clears draft

- **Given** a saved tx create draft exists
- **When** the user opens Add, dismisses, and chooses Discard
- **Then** the sheet closes and the draft is cleared
- **And** reopening Add shows clean create defaults

### Scenario: Successful create clears draft

- **Given** a saved tx create draft exists
- **When** the user opens Add, completes a successful save
- **Then** the draft for tx create is cleared

### Scenario: Edit unaffected

- **Given** the user opens Edit on an existing transaction with unsaved changes
- **When** they dismiss
- **Then** the discard confirm has Discard and Cancel only (no Save draft)
- **And** no create draft is written

### Scenario: Pocket create draft

- **Given** Add pocket is dirty
- **When** the user Save drafts, closes, and reopens Add pocket
- **Then** fields restore and the form is dirty (discard still prompts)

### Scenario: Category create draft per kind

- **Given** Add Expense category has a saved draft
- **When** the user opens Add Income category
- **Then** Income create does not show the Expense draft
- **And** reopening Add Expense restores the Expense draft and is dirty

### Scenario: Garbage storage

- **Given** `sessionStorage` holds invalid JSON for a draft key
- **When** the matching create surface opens
- **Then** the form opens at clean defaults without crashing

## Traceability

- Vitest: `src/lib/shared/create-form-drafts.test.ts`
- Playwright: `e2e/create-form-drafts.e2e.ts`
- Implementation: `src/lib/shared/create-form-drafts.ts`; `ConfirmDialog.svelte`; `QuickAddSheet.svelte`; `PocketsPanel.svelte`; `CategoriesPanel.svelte`

## Related

- Spec 080, 085 (dirty modal dismiss)
- Spec 102 (sessionStorage helper pattern)
- Spec 037, 044, 070, 018 (create surfaces)
