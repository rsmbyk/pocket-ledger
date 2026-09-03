# Spec 126: Categories mobile chrome, tap-to-hide, long-press edit

- **ID:** 126
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Categories, group headers sit on one vertical center, the Income | Expenses tabs match the catalog width, and below `md` hide/show is a tap on the chip (no eye button) while custom rename is a long-press.

## Scope

### In scope

1. **Header alignment** — Each group card header is one row. The group title and the header plus (`category-add-in-group`) share the same vertical center. Do not change header height except as needed for that alignment.
2. **Tab inset** — `category-kind-tabs` uses the same horizontal inset as search, the Add group / Reorder row, and the group-card frame. On a viewport below `md`, the tab list is not wider than those surfaces.
3. **Tap to hide/show (below `md`)** — The eye / eye-off button is not shown. A short press (click or tap) on a chip toggles hide ↔ show using the existing 123 use cases. Hidden chips stay muted/flat; shown chips stay raised. `data-hidden` and picker omission stay 123.
4. **Long-press edit (below `md`)** — Holding a **custom** chip for **500ms** opens the category rename **dialog** (150; was inline on the chip in 124). Stock chips have no rename. A press that reaches 500ms does **not** also toggle hide/show.
5. **Desktop unchanged (`md` and up)** — Hover (or focus-within) still reveals icon-only hide/show for every chip and icon-only edit for custom chips only. A click on the chip label does **not** toggle hide/show.

### Out of scope

- Reorder list drop targets (Spec 127)
- Overlay, stock ids, hide/show uniqueness, picker, month-chart order (123)
- Dragging categories; renaming or deleting groups
- Persisting search; `@media (hover)` / coarse pointer (breakpoint is viewport `md` only)
- Android

## Domain / UI rules

### Breakpoint

- **Below `md`:** Tailwind default, width **&lt; 768px**.
- **`md` and up:** width **≥ 768px**.
- Match Specs 111–114. Do not use hover/pointer media for this split.

### Header

- `Card.Header` is a single alignment row (`items-center`). The action must not `row-span-2` in a way that offsets the plus from the title.
- Title text and plus control: vertical centers within **3px**.

### Tabs

- Left and right edges of the tab list match the catalog column (search field and/or the group-card scroll frame) within **2px**.
- Tabs stay centered in that inset; labels remain Income | Expenses.

### Chip press (below `md`)

Pure helper (injectable, no Dexie / no Svelte) so Vitest can lock the outcomes:

| Press | Custom | Stock |
| --- | --- | --- |
| Duration &lt; 500ms, no slop | **toggle** hide/show | **toggle** hide/show |
| Duration ≥ 500ms, no slop | **rename** (no toggle) | **none** (no toggle, no rename) |
| Pointer moved past slop or left the chip | **none** | **none** |

- Long-press threshold: **500ms**.
- Slop: **10 CSS px** from pointer-down.
- While the rename **dialog** is open (150): press outcomes on that chip are **none** (no toggle). Escape closes the dialog.
- Below `md`, `category-hide` / `category-show` are absent (not in the document, or `hidden` / not visible).
- Below `md`, the visible pencil is absent. Custom chips still expose `category-edit-name` as a **visually hidden** control (accessible name `Edit {name}`) that starts the same rename dialog. Long-press is the touch path.
- Below `md`, the chip is the hide/show control: accessible name includes Hide or Show plus the category name (e.g. `Hide Groceries` / `Show Groceries`).
- Below `md`, `contextmenu` on a chip is prevented so a long-press is not stolen by the OS menu.
- `md+`: helper is unused for click-to-toggle; 124 hover buttons remain the only hide/show and visible-edit path.

## Acceptance scenarios

### Scenario: Header title and plus share a midline

- **Given** Categories in view mode with at least one group card
- **When** the group header is shown
- **Then** the vertical center of the group title and the vertical center of `category-add-in-group` differ by at most 3px

### Scenario: Tabs match catalog inset below md

- **Given** a viewport **390×844** and Categories
- **When** the stage is shown
- **Then** the left and right edges of `category-kind-tabs` match the search field (or the catalog frame if search is hidden) within 2px
- **And** the tab list is not wider than that catalog column

### Scenario: Tap toggles hide below md

- **Given** a viewport **390×844**, Expenses, virgin catalog
- **When** the user short-presses the Groceries chip
- **Then** Groceries is hidden (`data-hidden`)
- **And** `category-hide` / `category-show` are not visible
- **And** Groceries is omitted from the expense picker
- **When** the user short-presses Groceries again
- **Then** it is shown and available in the picker

### Scenario: Long-press renames custom below md

- **Given** a viewport **390×844**, Expenses, custom Warung
- **When** the user presses Warung for at least 500ms without moving past slop
- **Then** the category rename dialog is open for Warung
- **And** Warung’s hidden state is unchanged
- **And** the visible pencil control is not shown

### Scenario: Long-press on stock does not toggle

- **Given** a viewport **390×844**, Expenses, Groceries shown
- **When** the user presses Groceries for at least 500ms without moving past slop
- **Then** Groceries stays shown
- **And** rename does not start

### Scenario: Rename dialog open ignores tap

- **Given** a viewport **390×844** and the category rename dialog open for a custom chip
- **When** the user would otherwise short-press that chip
- **Then** hide/show does not change
- **And** rename stays open until save, Cancel, or Escape

### Scenario: Desktop hover hide still uses the eye

- **Given** a viewport **1280×800**, Expenses
- **When** the user hovers Groceries and activates hide
- **Then** Groceries is hidden
- **And** `category-hide` was the control
- **And** a click on the chip label (not the eye) does not toggle

### Scenario: Desktop custom edit still uses the pencil

- **Given** a viewport **1280×800**, custom Warung
- **When** the user hovers Warung
- **Then** `category-edit-name` is the visible pencil
- **And** a short click on the chip label does not start rename

## Traceability

- Vitest: `apps/web/src/lib/shared/category-chip-press.test.ts`
- Playwright: `e2e/categories.e2e.ts` (header midline; tab inset at 390; tap hide at 390; long-press rename; stock long-press no toggle; existing 1280 hover hide/edit stay green)
- Implementation: `CategoriesPanel.svelte`; `category-chip-press.ts`; Card header classes only as needed
- Docs: this folder; `specs/README.md` index
- Supersedes (below `md` only): Spec 124 “hover reveals show/hide and edit”
- Depends on: 123, 124, 125

## Related

- 127 reorder drop-between (separate slice)
