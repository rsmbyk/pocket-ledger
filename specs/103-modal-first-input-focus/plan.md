# Plan 103: Modal first-input autofocus

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 041 (modal platform)

## Why

Opening a form modal should put the caret in the first field the user will type into. Today bits-ui focuses the **first focusable** control, which on transaction create is often mode tabs / Income·Expense buttons — not Amount. Category, pocket, and show-money dialogs similarly benefit from landing on the name/passphrase field.

## Scope / edges

**In:** Shared Dialog + Sheet content autofocus the first enabled, visible **text** control (typing `input` types, `textarea` only — not `select`). Skip disabled/readonly, select/checkbox/radio/button/submit/date overlays, tabs, dropdown triggers, Close/X. If none match, leave bits-ui default. ConfirmDialog with no text fields keeps default button focus.

**Out:** Field order/copy changes; focus restore on close beyond bits-ui; suppressing mobile virtual keyboard; per-panel `autofocus` attributes unless a one-off exception appears.

## Approach

- Helper `focusFirstTextField` / `findFirstTextField` (query + focus), unit-tested
- Wire via `onOpenAutoFocus` on `dialog-content.svelte` and `sheet-content.svelte`
- Extract caller `onOpenAutoFocus` from rest props; apply helper first (preventDefault when focused); invoke caller afterward so they can override

## TDD

- Vitest (browser): `src/lib/ui/focus-first-text-field.svelte.test.ts`
- Playwright: `e2e/modal-focus.e2e.ts`
