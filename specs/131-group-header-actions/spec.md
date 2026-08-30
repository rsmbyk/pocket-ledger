# Spec 131: Categories group header actions

- **ID:** 131
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Each group card header exposes icon-only hide, rename (custom), and add. Desktop shows them on hover. On small screens the name is the hide/rename surface (hold vs click); add stays visible. A fully hidden group looks muted as a whole.

## Scope

### In scope

1. **Actions (left to right)** — eye · edit (custom groups only) · add. Stock has no edit.
2. **Icon-only** — no visible labels. `icon-xs`. **aria-label** only (Hide group / Show group, Rename {name}, Add category to {name}).
3. **Separators** — vertical rule **left of the first visible action** and **between** actions. Not after add.
4. **Eye** — if **every** category in the group is hidden, the control is eye-off and the next hide/show **shows** all; otherwise it **hides** all. Uses existing `hideCategory` / `showCategory`. Empty group: eye disabled; hold is a no-op.
5. **Edit** — opens **Rename group** dialog (same name field + uniqueness as Add group). `renameCategoryGroup`: normalize like add; unique within kind (case-insensitive, `exceptId`); stock ids throw.
6. **Add** — existing in-group add (`category-add-in-group`).
7. **`md` and up** — eye, edit, and add are **not visible** until header **hover** or **focus-within**. Then click the icons.
8. **Below `md`** — hide eye and edit. **Add stays visible** with the left separator. On the **name** (not add): **click** opens rename (custom only; stock no-op); **hold 500ms** toggles group visibility and does **not** open rename. (Inverse of Spec 126 chips: chip tap = hide, hold = edit.)
9. **All hidden** — the **card** uses the same muted/flat treatment as a hidden chip (`opacity-60`, no raise). Chips stay listed. `data-group-hidden="true"` when all members are hidden.

### Out of scope

- Deleting groups; renaming stock groups; reorder-list rename
- Catalog grid (128); toolbar (129); picker search (130)
- Changing 126 chip hover / tap / long-press
- Android

## Domain / UI rules

- Custom group: `source === 'custom'` (UUID overlay row). Stock: `stock-group:…`.
- Header stays one row; title and actions share vertical center (126).
- Breakpoint is viewport `md` (768px), same as 126.
- Picker still omits hidden members (123). Hidden chips stay on the Categories card.

## Acceptance scenarios

### Scenario: Desktop hover shows icon cluster

- **Given** a custom group, viewport **≥ 768px**, pointer not on the header
- **When** the header is idle
- **Then** eye, edit, and add are not visible
- **When** the user hovers (or focus-within) the header
- **Then** eye, edit, and add appear in that order with separators as specified

### Scenario: Stock has no pencil

- **Given** Work (stock), header hovered, viewport **≥ 768px**
- **When** the actions are shown
- **Then** there is no rename control
- **And** eye and add are present

### Scenario: Eye hides then shows the whole group

- **Given** Work with all chips shown, header hovered
- **When** the user activates Hide group
- **Then** every Work chip is hidden (muted)
- **And** the card has `data-group-hidden="true"` and the muted card chrome
- **When** the user activates Show group
- **Then** every Work chip is shown
- **And** `data-group-hidden` is absent

### Scenario: Rename custom group

- **Given** a custom group named `Side hustle`
- **When** the user opens rename (pencil on `md+`, or click the name below `md`) and saves `Gig work`
- **Then** the card title is `Gig work`
- **And** the picker heading uses `Gig work`
- **And** a duplicate name in the same kind is rejected with the existing uniqueness error

### Scenario: Phone: add stays; name click vs hold

- **Given** a custom group, viewport **390px**
- **When** the header is shown
- **Then** add is visible with a left separator
- **And** eye and edit are not shown
- **When** the user clicks the group name
- **Then** the Rename group dialog opens
- **When** the user instead holds the name for 500ms
- **Then** all chips in the group toggle hidden
- **And** the rename dialog does not open

### Scenario: Phone stock name click does not rename

- **Given** Work (stock), viewport **390px**
- **When** the user clicks the name
- **Then** no rename dialog opens
- **And** hold still toggles group visibility

## Traceability

- Vitest: `apps/web/src/lib/application/categories.test.ts` (`renameCategoryGroup`: happy path, uniqueness, stock throws)
- Playwright: `e2e/categories.e2e.ts` (hover cluster + separators; stock no edit; eye all-hidden card; rename dialog; 390px add visible, click name vs hold)
- Implementation: `CategoriesPanel.svelte`; `createCategoryGroup` neighbor `renameCategoryGroup` in `apps/web/src/lib/application/categories.ts`
- Docs: this folder; `specs/README.md` index
- Depends on: 123, 124, 126
- Related: 018 add dialog chrome; 125–127 left group rename out of scope

## Related

- 126 chip gestures remain tap-hide / hold-edit; this spec is **header name** only
