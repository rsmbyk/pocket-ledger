# Plan 079: Inline field errors on all forms

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Validation failures land in a lone banner above Save (or nowhere useful). Field problems should sit under the field that failed — on every form, not only the transaction sheet.

## Scope / edges

**In:** Tx sheet; pocket create/edit; categories add + rename; More lock enable/disable; Unlock. Field-keyed alerts + `aria-invalid`; non-field errors stay form-level; clear on field edit.

**Out:** Changing domain copy; validate-on-blur; dirty-dismiss stuck-open (080); toasts.

## Approach

- Prefer assigning field keys at the catch site when the form knows which field failed
- Optional shared classifier for stable thrown messages (`form-field-error.ts` or similar)
- `data-testid` pattern: `{surface}-field-error-{key}` (e.g. `tx-field-error-amount`)

## TDD

- Vitest: classifier / known-message → field
- Playwright: one case per surface (tx amount; pocket opening; category name; lock mismatch or unlock)
