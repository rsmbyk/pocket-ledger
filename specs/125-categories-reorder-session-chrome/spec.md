# Spec 125: Categories reorder session and chrome

- **ID:** 125
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Reorder Categories as **one session for both kinds**: switch Income and Expenses freely, keep both drafts, Save both, Discard to the pre-reorder snapshot and leave the mode. Hide search while reordering. Tighten the page chrome so search lines up with the catalog and the kind tabs stay tinted in dark mode.

## Scope

### In scope

1. **Reorder session** — Entering Reorder snapshots current income **and** expense group order. The on-screen list is still one kind (the selected tab). Switching tabs in reorder does **not** confirm and does **not** throw away the other kind’s draft.
2. **Save** — Persist both kinds’ drafts (even if only one kind moved), then exit reorder. Overlay prefs rules stay Spec 123 (omit a kind’s key when it matches factory).
3. **Discard** — Restore both kinds to the enter snapshot and **exit** reorder. Replaces Done. No confirm. Not dirty still exits (snapshot equals drafts).
4. **Reset** — Unchanged from 123, **visible kind only**: built-in groups to factory order, customs after; stay in reorder; dirty until Save.
5. **Search in reorder** — The search field is not shown. Entering Reorder clears the query. Leaving reorder (Save or Discard) shows search again, still empty.
6. **Leave Categories** — Unchanged confirm when the session is dirty; Leave discards both kinds’ drafts (same as Discard without staying).
7. **Chrome (visual)** — Search and the Add group / Reorder (or Save / Discard / Reset) row share the catalog’s horizontal inset. Group card headers are shorter. Chip labels use the default cursor, not the text I-beam. Add group and Reorder leading icons sit on the label’s cap-height. Income / Expenses active fill stays clearly green / red in dark mode.

### Out of scope

- Dragging categories; renaming or deleting groups
- Persisting search; Reset of both kinds in one click
- Auto-save when switching tabs
- Android

## Domain / UI rules

### Dual-kind draft

- Shape: `{ income: string[], expense: string[] }` — group ids in display order.
- **Snapshot** = that shape at Reorder enter (resolved overlay order, Spec 123).
- **Draft** starts as a copy of the snapshot. DnD updates only `draft[selectedKind]`.
- **Dirty** iff either kind’s id list differs from the snapshot (order-sensitive).
- Helper is pure and injectable for Vitest (no Dexie). Persistence stays `saveCategoryGroupOrder(kind, ids)` twice on Save.

### Toolbar in reorder

Visible: **Reset**, **Discard**, **Save**. No **Done**.
Save disabled when not dirty (and when busy). Discard always enabled (exits).

### Search

- View mode: shown, live filter of the selected kind (124).
- Reorder: wrap not in the document (or `hidden`); `searchQuery` is `''`.
- `data-testid="category-search"` absent or not visible in reorder.

### Tabs

- Income / Expenses remain usable in reorder.
- Dark mode: active Income uses a green fill + green text; active Expenses uses a red fill + red text. Do not let the default Tabs trigger `dark:data-active:bg-input/30` win.

## Acceptance scenarios

### Scenario: Search hidden in reorder

- **Given** Categories in view mode with search text `groc`
- **When** the user chooses Reorder
- **Then** the search field is not visible
- **And** only group names of the selected kind are listed
- **When** the user Discards
- **Then** search is visible and empty
- **And** the full selected-kind catalog is shown (not a leftover `groc` filter)

### Scenario: No Done control

- **Given** reorder mode
- **When** the toolbar is shown
- **Then** Reset, Discard, and Save are visible
- **And** there is no Done button

### Scenario: Discard restores and exits

- **Given** reorder mode with Utilities dragged above Home (unsaved)
- **When** the user chooses Discard
- **Then** the page is back in view mode (chips visible)
- **And** Home is still before Utilities after a refresh

### Scenario: Tab switch keeps both drafts

- **Given** reorder on Expenses, Utilities above Home in the expense draft
- **When** the user activates Income, drags Work below Business & creating, then activates Expenses again
- **Then** Utilities is still above Home in the expense list
- **And** no leave-reorder confirm appeared

### Scenario: Save writes both kinds

- **Given** reorder drafts with expense order changed and income order changed
- **When** the user saves
- **Then** both orders persist after leaving reorder and after reload
- **And** the page is in view mode

### Scenario: Reset is the visible kind

- **Given** reorder on Expenses with a custom saved order
- **When** the user chooses Reset
- **Then** expense built-in groups match factory order and customs follow
- **And** the income draft is unchanged
- **And** reorder mode stays on

### Scenario: Dirty leave Categories

- **Given** reorder mode with an unsaved expense move
- **When** the user navigates to Activity
- **Then** the existing leave confirm is shown
- **And** Leave keeps the last saved order for both kinds

## Traceability

- Vitest: `apps/web/src/lib/domain/category-reorder-session.test.ts`
- Playwright: `e2e/categories.e2e.ts` (search hidden; no Done; Discard exits; tab switch keeps drafts; Save both kinds)
- Implementation: `category-reorder-session.ts`, `CategoriesPanel.svelte` (and tab classes)
- Docs: this folder
- Supersedes: Spec 123 Discard “stay in reorder”; Spec 124 “reorder is the selected kind only” for the **session** (the on-screen list is still one kind); Spec 124 dirty tab-switch leave confirm
- Depends on: 123, 124

## Related

- 123 overlay reorder domain, 124 kind tabs / search
