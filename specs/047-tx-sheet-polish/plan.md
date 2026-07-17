# Plan 047: Transaction sheet polish

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Follow-up polish after 039–044: dropdown affordance, amount field balance, DateField toggle, labels that don’t steal clicks, and a clearer Void control in the header.

## Scope / edges

**In:** category dropdown item cursor; currency prefix horizontal padding; DateField open↔close on trigger; labels do not activate fields; Void outlined danger + vertically centered in modal/sheet header.

**Out:** Calendar library; filter labels (049); amount-hide (048); Categories (050).

## Approach

- `dropdown-menu-item`: `cursor-pointer` (align with Spec 043 pointer rules).
- QuickAdd currency addon: equal horizontal padding (e.g. `px-2.5`).
- DateField: track open state; second trigger click closes (blur native); clear on change/cancel/blur. Keep native `showPicker`.
- Labels: remove `for`/`id` coupling; `aria-label` on inner controls only.
- Void: `variant="outline"` + destructive border/text; header `items-center`.

## TDD

- Vitest: none
- Playwright: `e2e/tx-sheet-polish.e2e.ts` (scenarios in tasks/spec)

## Out of scope

New date-picker dependency; changing void ConfirmDialog copy.
