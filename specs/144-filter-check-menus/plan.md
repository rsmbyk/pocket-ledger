# Plan 144: Type / Pocket filter checkboxes like Category

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Transactions Filters **Type** and **Pocket** menus use the same left-square, stay-open checkboxes as Category. Matching stays 139 (empty = All).

## Why

Type and Pocket already multi-select, but Bits `DropdownMenu.CheckboxItem` puts a trailing check on the right. Category’s Popover rows show a left square that fills while the menu stays open — that is the checkbox people expect.

## Scope

- Shared `FilterCheckSelect` (Popover + Command, no search)
- Wire Type and Pocket in `AppShellChrome`; keep testids
- Playwright stay-open + trigger `All` / `N selected`

## Out of this slice

- Empty=All matching; CategoryPicker; search; Amount / voided; tx-sheet pickers
