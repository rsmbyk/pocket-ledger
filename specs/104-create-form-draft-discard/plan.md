# Plan 104: Create-form draft on discard (session)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 080/085 (dirty discard); Spec 102 (sessionStorage pattern)

## Why

Creating a transaction, pocket, or category often gets interrupted. Discard either loses everything (tx) or closes silently (pocket/category). Users need a **Save draft** path on create-only dismiss, restored the next time they open that same create window, still treated as dirty.

## Scope / edges

**In:** Create surfaces only — Add transaction (Normal + Transfer), Add pocket, Add category (Income + Expense). `sessionStorage` drafts; three-action discard on create (Cancel / Discard / Save draft); restore hydrates against clean create baselines so the form is dirty; pocket/category create gain prevent-then-warn dirty dismiss; clear draft on Discard or successful create.

**Out:** Edit drafts; activity filter drafts; `localStorage` / IndexedDB; auto-save while typing; cross-tab sync; changing edit discard chrome.

## Approach

- Shared module `src/lib/shared/create-form-drafts.ts` (injectable Storage, parse/validate/read/write/clear) patterned on activity-list-session
- Keys: `pocket-ledger-draft-tx-create`, `pocket-ledger-draft-pocket-create`, `pocket-ledger-draft-category-create-income` / `…-expense`
- Extend `ConfirmDialog` with optional secondary action for **Save draft**
- Wire QuickAddSheet / PocketsPanel / CategoriesPanel create paths only

## TDD

- Vitest: `src/lib/shared/create-form-drafts.test.ts`
- Playwright: save/restore dirty, Discard clears, success clears; pocket + category create; edit untouched
