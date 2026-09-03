# Spec 150: Category rename modal

- **ID:** 150
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Categories, renaming a custom category uses the same modal chrome as renaming a group. Add/rename dialogs for groups and categories name the kind in the title and tint the header like a group card. Name fields get a muted helper: the frozen current name on rename, the parent group on add category.

## Scope

### In scope

1. **Category rename is a modal** — Pencil (`category-edit-name`), mobile long-press 500ms (126), and the sr-only Edit control open a dialog. Same chrome as Rename group: Name, helper, error, Cancel + Save. Testids: `category-rename-dialog`, `category-rename-name-input`, `category-rename-save`, `category-rename-helper`. Save is disabled when empty **or** unchanged from the name at open (034). Prefill the current name. The chip stays a chip while the dialog is open (no `category-save-name` on the chip). Stock still has no edit. Triggers and uniqueness unchanged.
2. **Kind in the title + header tint** — Toolbar **Add group** label stays. Dialog titles use `kindMeta.title` (`Income` / `Expenses`):
   - Add group → **Add Income group** / **Add Expenses group**
   - Rename group → **Rename Income group** / **Rename Expenses group**
   - Add category → **Add Income category** / **Add Expenses category**
   - Rename category → **Rename Income category** / **Rename Expenses category**
   Header color matches the group **card header** (`kindMeta.headerClass`): Income `border-income/20 bg-income/5`; Expenses `border-destructive/20 bg-destructive/5`. Full width of the sheet, pulled to the rounded top as a band. Description under the title stays muted (existing copy: placed last / unique among / custom tag icon).
3. **Name-field helpers** — Placeholder stays `Name`. Helper `text-muted-foreground text-xs` under the input (above field errors).
   - Rename group / rename category — **`Current: {name}`** frozen at open (not the live draft). Testids `category-rename-group-helper`, `category-rename-helper`.
   - Add category — **`In {group.name}`** for the group whose plus opened the dialog. Testid `category-add-helper`. Keep Dialog.Description “Custom labels use the tag icon.”
   - Add group — no extra helper (description already “Placed last among …”).

### Out of scope

- Stock rename; uniqueness rules; pocket rename
- Changing hide/show, hover pencils, long-press timing
- Toolbar button copy (“Add group”)

## Domain / UI rules

- Supersedes 124/126 **inline** chip rename. Spec 022/034 chip Save is dialog Save (`category-rename-save`).
- Group rename Save is also disabled when the draft is empty or unchanged from the name frozen at open.
- Escape / Cancel close the rename dialog without a discard confirm (same as today’s group rename).

## Acceptance scenarios

### Scenario: Hover edit opens the rename dialog

- **Given** custom Warung on Expenses
- **When** the user activates `category-edit-name` on the chip
- **Then** `category-rename-dialog` is visible with title **Rename Expenses category**
- **And** the name field is prefilled `Warung`
- **And** the chip is still a chip (no `category-save-name`)
- **When** they save `Warung kopi` via `category-rename-save`
- **Then** the chip is renamed
- **And** Groceries still has no edit control

### Scenario: Long-press opens the same dialog

- **Given** a viewport **390×844**, custom Warung
- **When** the user long-presses Warung for 500ms
- **Then** `category-rename-dialog` is visible
- **And** Warung’s hidden state is unchanged

### Scenario: Kind titles and header tint

- **Given** Expenses
- **When** the user opens Add category from Food & drink
- **Then** the title is **Add Expenses category**
- **And** the dialog header uses the Expenses card-header tint (`bg-destructive/5`)
- **Given** Income
- **When** the user opens Add group
- **Then** the title is **Add Income group**
- **And** the dialog header uses the Income card-header tint (`bg-income/5`)

### Scenario: Helpers

- **Given** Add category from Food & drink
- **When** the dialog is open
- **Then** `category-add-helper` is `In Food & drink`
- **And** the placeholder is still `Name`
- **Given** Rename group (or category) with original name `Side hustle`
- **When** the user edits the draft to `Gig work`
- **Then** the helper is still `Current: Side hustle`

### Scenario: Unchanged save stays disabled

- **Given** the category rename dialog just opened
- **When** the draft still equals the frozen name
- **Then** `category-rename-save` is disabled
- **When** the draft is emptied
- **Then** it stays disabled
- **When** the draft differs
- **Then** it is enabled (primary)

## Traceability

- Vitest: none (dialog chrome only; chip-press outcomes unchanged)
- Playwright: `e2e/categories.e2e.ts`; retarget `category-save-name` → `category-rename-save`; `e2e/modal-focus.e2e.ts` if first-field focus is asserted on the new dialog
- Implementation: `CategoriesPanel.svelte`
- Docs: this folder; `specs/README.md`; 124/126 inline-rename lines; 022/034 save testid; `docs/PRODUCT.md`

## Related

- 018 add modal; 022/034 save enablement; 124 hover edit; 126 long-press; 131 group rename dialog
