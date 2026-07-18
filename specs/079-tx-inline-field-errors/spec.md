# Spec 079: Inline field errors on all forms

- **ID:** 079
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

**Field-related** validation errors appear **inline under the field** they refer to — on every user-facing form — not as a lone banner above the actions.

## Scope

### In scope

1. After submit/Save fails with a field validation error, show the message under that field (`role="alert"`, destructive text)
2. Mark the related control `aria-invalid` while that field error is active
3. Surfaces and field mapping:

| Surface | File | Fields |
|---|---|---|
| Tx Add/Edit (Normal + Transfer) | `QuickAddSheet.svelte` | Amount; Date; Category; Pocket (078); Transfer Source / Dest |
| Pocket create/edit | `PocketsPanel.svelte` | Name; Opening balance; As of; Goal target; Goal date |
| Categories add dialog + rename row | `CategoriesPanel.svelte` | Name |
| Enable / disable lock | `MorePanel.svelte` | Passphrase; Confirm passphrase |
| Unlock | `UnlockScreen.svelte` | Passphrase |

4. Transfer same-pocket warning stays inline under Transfer pocket controls (`tx-transfer-same-pocket-warn`)
5. Errors that are **not** field-specific remain a form-level alert near the actions (e.g. void failure, delete refusals, export/reset, unexpected save failure, “Main cannot be deleted”)
6. Clear a field’s error when the user changes that field (and on open/mode reset as today)

### Out of scope

- Changing the wording of domain error strings
- Validate-on-blur / live validation before Save
- Dirty outside-dismiss / stuck-open (080)
- App boot / DB open errors (`App.svelte`)

## Domain rules

- No change to validation rules — only presentation
- Prefer UI-assigned field keys when the catch site knows the field; optional message classifier for stable thrown strings
- Do not invent new user-facing copy

## Acceptance scenarios

### Scenario: Tx zero amount under Amount

- **Given** Add transaction open with amount that fails greater-than-zero / required
- **When** the user taps Save
- **Then** an alert appears directly under the Amount control (`tx-field-error-amount` or equivalent)
- **And** the Amount control is `aria-invalid`
- **And** the message is not only a banner above Save with no field association

### Scenario: Pocket bad opening under Opening

- **Given** pocket create/edit with a non-whole opening balance
- **When** the user saves
- **Then** the error appears under Opening balance

### Scenario: Category name under Name

- **Given** category add or rename that fails with a name-related error
- **When** the failure surfaces
- **Then** the alert appears under that name input

### Scenario: Lock mismatch under confirm

- **Given** Enable lock with mismatched passphrase and confirm
- **When** the user submits
- **Then** the mismatch alert appears under the confirm field (or clearly associated with confirm)

### Scenario: Unlock incorrect under passphrase

- **Given** Unlock with an incorrect passphrase
- **When** unlock fails
- **Then** the alert appears under the passphrase field with `aria-invalid`

### Scenario: Non-field error stays form-level

- **Given** a failure not tied to a single input
- **When** it surfaces
- **Then** the alert remains at form level near actions (not forced under an unrelated field)

### Scenario: Editing clears field error

- **Given** an inline field error is showing
- **When** the user changes that field
- **Then** that field’s inline error clears until the next failed submit

## Traceability

- Vitest: optional `classifyFormFieldError(message) → field | 'form'`
- Playwright: tx amount; pocket opening; at least one of category name / lock / unlock
- Implementation: listed surfaces + small helper if extracted

## Related

- 047, 073, 078, 080
