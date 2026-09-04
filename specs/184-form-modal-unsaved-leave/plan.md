# Plan 184: Form modal unsaved-leave

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 080, 085, 104

## Why

Editable form Dialogs and Sheets should not vanish with typed work. Add transaction already prevent-then-warns and can Save draft. Other form hosts either close silently or still offer Save draft that Ronald does not want.

## Approach

One product rule: dirty leave on every editable form Dialog/Sheet is prevent-then-warn. **Save draft only on Add transaction.** Two-button Cancel / Discard everywhere else, including Add pocket and Add category (supersede 104 for those surfaces). Add the missing warns (goal, pocket edit, category group/rename).

## Scope / edges

**In:** tx (unchanged except rule restated), pocket add+edit, goal add+edit, category add, add/rename group, rename category. Filters already compliant.

**Out:** popovers, command palette, passphrase modals, nested ConfirmDialogs, Past goals, category reorder (own confirm).
