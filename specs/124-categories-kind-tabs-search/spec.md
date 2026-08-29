# Spec 124: Categories kind tabs, search, hover chips

- **ID:** 124
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Make Categories a **one-kind** page: centered Income | Expenses tabs, full width, search, and per-group cards with hover chip actions. Overlay, stock ids, hide/show domain, add/rename rules, and the form picker stay Spec 123.

## Scope

### In scope

1. **Kind tabs** at the center-top of the Categories stage (not the app title bar). Labels **Income** and **Expenses**. Income is green-tinted; Expenses is red-tinted. Only the selected kind’s groups and categories render.
2. **Default + session:** first visit in a tab is Income. The selected kind is stored in `sessionStorage` (key `pocket-ledger-categories-kind`) for the current browser tab, including reload and leaving/returning to `/categories`. Closing the tab clears it. Not `localStorage`.
3. **Full width:** the Categories stage is not capped at `max-w-3xl`; it uses the inset content width.
4. **Search** directly under the tabs, full width of the stage. Filters the selected kind by **group label** and **category label** (live, case-insensitive substring). Search text is not persisted.
5. **Toolbar** under search: **Add group** and **Reorder**, each with a leading icon. No page-level **Edit** / **Done** control.
6. **Group cards:** each group of the selected kind is its own card. Card header is the group name. Income cards green-tinted; expense cards red-tinted. Header includes an icon-only **add** (plus) that opens the existing add-category dialog (018/123) for that group. No add row inside the chip list.
7. **Chips:** each category is a chip (icon + label). Shown (not hidden) chips are slightly raised. Hover (and focus-within) highlights the chip and reveals icon-only **show/hide** for every category and icon-only **edit** for **custom** categories only. Stock has no edit control and cannot be renamed.
8. **Reorder:** still group names + DnD within the **selected kind** only (Save / Discard / Reset / dirty leave from 123). Tabs remain; switching kind while the reorder draft is dirty uses the existing leave confirm (leave discards, then switches).
9. **Viewport:** tabs, search, and toolbar stay on screen; the group-card area scrolls inside the remaining height so the document does not grow with the catalog.

### Out of scope

- Catalog, overlay, migrate, picker, month-chart order (123)
- Custom icon picker; deleting or renaming groups; dragging categories
- Persisting search
- Changing hide/show/rename uniqueness rules
- Android

## Domain / storage rules

### Kind session

- Values: `'income' | 'expense'`. Default `'income'`.
- Key: `pocket-ledger-categories-kind`. JSON object `{ "kind": "income" | "expense" }` or a bare allowed string; malformed / unknown → Income.
- Injectable `Storage` for Vitest (same pattern as Spec 102).
- Write when the user selects a tab. Read on Categories panel mount.

### Search filter (pure)

Given selected-kind groups (already in user/factory order) and their categories:

- Blank query: all those groups, all their categories (including hidden).
- Non-blank: a group is included if its **name** matches **or** at least one of its categories’ **names** match.
- If the group name matches: show **all** categories in that group.
- If only some category names match: show **only** those matching categories (add-plus still on the header).
- Compare with trim + case-insensitive substring.
- Zero included groups: empty state copy that search has no matches (do not leave a blank stage).

This is presentation filtering only. Dexie and overlay prefs are unchanged.

### Add group

- Kind is the selected tab. No kind `<select>` in the dialog.
- Still last among that kind (123).

### Chips and actions

- Shown chip: slight raise (shadow / translate). Hidden chip: flat, muted (123 opacity is fine), not raised.
- Hover or `:focus-within`: highlight + reveal actions.
- **Show/hide:** existing `category-hide` / `category-show` test ids; eye / eye-off; stock and custom.
- **Edit (custom only):** pencil, `data-testid="category-edit-name"`. Activating it starts inline rename on that chip (input + Spec 022 save-name check). Rename UI stays until save or the user cancels (Escape or empty-blur — pick one in implementation and keep it consistent); pointer leaving the chip does not cancel.
- Stock chips never show a pencil.
- Remove `category-edit-mode` and the global edit/view mode.

### Layout

- Tabs centered at the top of the stage.
- Search full width under tabs.
- Add group + Reorder under search, trailing (right) as today.
- Group cards wrap to fill the stage width (more than one card per row when the viewport allows). Not a two-kind column grid.
- `data-testid`s: `category-kind-tabs`, `category-kind-income`, `category-kind-expense`, `category-search`. Keep `category-add-in-group` on the header plus, `category-add-group`, `category-reorder`, `category-chip`, group test ids from 123.

## Acceptance scenarios

### Scenario: Default Income

- **Given** a new browser tab with no categories-kind session value
- **When** the user opens `/categories`
- **Then** Income is selected
- **And** Work (and other income groups) are on screen
- **And** Home / Groceries are not in the document

### Scenario: Switch to Expenses

- **Given** Categories on Income
- **When** the user activates Expenses
- **Then** Home and Groceries are visible
- **And** Salary is not in the document
- **And** the Expenses tab is the active, red-tinted segment

### Scenario: Kind survives reload

- **Given** Expenses is selected
- **When** the page reloads in the same tab
- **Then** Expenses is still selected and expense groups are shown

### Scenario: Kind survives leaving the page

- **Given** Expenses is selected
- **When** the user goes to Home and back to Categories in the same tab
- **Then** Expenses is still selected

### Scenario: Full width

- **Given** a wide desktop viewport
- **When** Categories is open
- **Then** the stage is wider than the Home `max-w-3xl` column (uses the inset content width)

### Scenario: Search category name

- **Given** Expenses and a virgin catalog
- **When** the user types `groc` in category search
- **Then** Food & drink is visible and contains Groceries
- **And** Home is not visible

### Scenario: Search group name

- **Given** Expenses and a virgin catalog
- **When** the user types `home` in category search
- **Then** the Home group is visible
- **And** its listed chips include Rent (group-name match shows the whole group)
- **And** Utilities is not visible

### Scenario: Search empty

- **Given** a query that matches nothing in the selected kind
- **When** the list updates
- **Then** an empty state explains there are no matches
- **And** Add group / Reorder remain available

### Scenario: Add from group header

- **Given** Expenses and Food & drink
- **When** the user activates the plus on that group’s header, types `Warung`, and saves
- **Then** Warung appears as a chip in Food & drink
- **And** there is no add chip in the group’s chip list

### Scenario: Add group uses tab kind

- **Given** Expenses is selected
- **When** the user adds a group named `Side`
- **Then** `Side` is last among expense groups
- **And** the dialog has no kind dropdown

### Scenario: Hover hide without Edit mode

- **Given** Expenses, not reorder
- **When** the user hovers (or focuses) Groceries and activates hide
- **Then** Groceries stays on the Categories list as hidden
- **And** it is omitted from the expense picker
- **And** no `category-edit-mode` control exists

### Scenario: Custom edit on hover

- **Given** custom Warung on Expenses
- **When** the user activates the chip’s edit control and saves a new name `Warung kopi`
- **Then** the custom row is renamed
- **And** a stock chip such as Groceries has no edit control

### Scenario: Shown chip raise

- **Given** a visible stock chip and a hidden chip
- **When** both are listed
- **Then** the shown chip is visually raised relative to the hidden chip

### Scenario: Reorder is the selected kind

- **Given** Expenses
- **When** the user chooses Reorder
- **Then** only expense group names are listed for DnD
- **And** income group rows are absent
- **And** category chips are hidden

### Scenario: Viewport does not grow with the catalog

- **Given** a desktop viewport ~1280×800 and Expenses
- **When** the full expense catalog is resolved
- **Then** the document does not grow by more than a few pixels past the viewport
- **And** the expense group-card region is scrollable
- **And** the kind tabs stay on screen

## Traceability

- Vitest: `apps/web/src/lib/shared/categories-kind-session.test.ts`, `apps/web/src/lib/domain/category-catalog-filter.test.ts`
- Playwright: `e2e/categories.e2e.ts` (tabs, session, search, header plus, hover hide/edit, reorder kind); `e2e/desktop-layout.e2e.ts` (full width + viewport-tall); helpers in `e2e/nav.ts`
- Implementation: `CategoriesPanel.svelte`, `AppShellChrome.svelte` stage width; session helper; filter helper
- Docs: this folder only unless PRODUCT copy mentions Categories layout
- Supersedes (Categories chrome): 021 two-column kind grid; 123 list add-chip + page-level edit mode
- Depends on: 010, 018, 022, 123
