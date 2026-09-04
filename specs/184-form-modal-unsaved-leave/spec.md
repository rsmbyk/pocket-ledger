# Spec 184: Form modal unsaved-leave

- **ID:** 184
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Every **editable form** Dialog or Sheet prevent-then-warns on dirty leave (Spec 080). **Save draft exists only on Add transaction** (Spec 104 tx create). All other form hosts use Cancel / Discard and do not write or restore `sessionStorage` drafts.

## Scope

### In scope

1. **Product rule** for form Dialog/Sheet hosts (fields + Save).
2. **Add/Edit transaction:** keep prevent-then-warn; create keeps Save draft; edit stays two-button.
3. **Add pocket / Add category:** drop Save draft and session restore; two-button copy; reopen is always clean create defaults.
4. **Missing warns:** Edit pocket; Add/Edit goal; Add group; Rename group; Rename category.
5. **Activity filters** already warn with filter-specific copy; leave that copy; no Save draft.

### Out of scope

- Nested ConfirmDialogs and action confirms (reset, import, sign out, void, drop goal, delete pocket, local conflict)
- Read-only Past goals
- Command palette
- Popovers (date range, currency, idle minutes, category picker, filter check-select, DateField calendar)
- Show-money unlock, export-backup passphrase, Settings inline privacy fields
- Category reorder (existing reorder discard)

## Domain / UI rules

- Prevent-then-warn: `preventDefault` interact-outside and Escape while dirty or while the discard confirm is open; ignore native DateField picker dismiss.
- Cancel discard: host never closed; values intact.
- Discard: host closes; no draft write except tx create Save draft.
- Clean form: close with no confirm.
- Successful Save: close with no confirm.
- Default two-button copy (pocket, goal, category add/rename/group):
  - Title: `Discard unsaved changes?`
  - Description: `Your edits will be lost if you leave without saving.`
  - Confirm: `Discard` (destructive); Cancel: `Cancel`
- Goal create is dirty when any field differs from empty defaults (description, target digits, date), not only when the target is valid.
- Goal drop confirm stays; do not stack discard on it.
- Spec 104 pocket/category Save-draft + restore scenarios are **superseded**. Tx 104 scenarios stand.

## Acceptance scenarios

### Scenario: Add transaction still Save drafts

- **Given** Add transaction is dirty
- **When** the user dismisses
- **Then** the confirm includes Save draft
- **And** Save draft restores on reopen (Spec 104)

### Scenario: Add pocket has no Save draft

- **Given** Add pocket is dirty
- **When** the user dismisses
- **Then** the confirm has Discard and Cancel only (no Save draft)
- **And** Discard closes; reopening Add pocket is empty

### Scenario: Edit pocket dirty leave

- **Given** Edit pocket has unsaved field changes
- **When** the user dismisses
- **Then** the two-button discard confirm appears and the form stays open until Cancel or Discard

### Scenario: Add goal dirty leave

- **Given** Add goal has a typed description or target
- **When** the user presses Cancel, X, Escape, or outside
- **Then** the two-button discard confirm appears
- **And** Cancel keeps the typed values
- **And** Discard closes the dialog

### Scenario: Add goal clean close

- **Given** Add goal with no edits
- **When** the user dismisses
- **Then** the dialog closes with no confirm

### Scenario: Category add, group, and rename warn without Save draft

- **Given** Add category, Add group, Rename group, or Rename category is dirty
- **When** the user dismisses
- **Then** the two-button discard confirm appears (no Save draft)
- **And** Discard closes; Cancel keeps editing

## Traceability

- Vitest: `apps/web/src/lib/application/goal-form-dirty.test.ts`; `apps/web/src/lib/shared/create-form-drafts.test.ts`
- Playwright: `e2e/create-form-drafts.e2e.ts`; `e2e/goals.e2e.ts`
- Implementation: `PocketGoalFormDialog.svelte`; `PocketsPanel.svelte`; `CategoriesPanel.svelte`; `QuickAddSheet.svelte` (tx unchanged); `create-form-drafts.ts`

## Related

- Spec 080, 085 (prevent-then-warn)
- Spec 104 (tx create Save draft only after this slice)
