# Plan 126: Categories mobile chrome, tap-to-hide, long-press edit

## What

Fix three Categories view-mode nits: group card headers align on one vertical center; Income | Expenses shares the catalog inset; below `md`, hide/show is a tap on the chip (eye button gone) and custom rename is a long-press.

## Why

Hover chip actions (Spec 124) do not work on phones. Tabs sit outside the `px-3` catalog wrapper, so on a narrow stage they are wider than search and the cards. `Card.Action` still `row-span-2` / `self-start`, so the header plus does not sit on the title’s midline.

## Scope

- Header: title and add-plus share one row and the same vertical center
- Tabs: same horizontal inset as search, toolbar, and group cards (125 already lined those three up)
- Below Tailwind `md` (768px): tap chip toggles hide/show; no eye button; custom long-press (500ms) starts inline rename
- `md` and up: unchanged 124 hover eye + pencil; chip click does not toggle

## Out of this slice

- Reorder drop-between / stuck groups (127)
- Hide/show domain, picker, overlay (123)
- Dragging categories; rename/delete groups
- Pointer/`hover` media (viewport `md` only, per Ronald)

## Edges

1. **Breakpoint:** below `md` vs `md+`. Playwright: 390×844 vs 1280×800 (same as 111 / desktop-layout).
2. **Tap vs long-press:** release before 500ms → toggle. Hold ≥500ms on custom → rename, no toggle. Hold ≥500ms on stock → neither rename nor toggle. Move past slop or leave the chip → cancel, no toggle.
3. **Rename open:** tap / long-press do not toggle; Escape still cancels (124).
4. **Custom edit a11y:** below `md`, visible pencil is gone; keep a visually hidden “Edit {name}” control (`category-edit-name`) so keyboard / AT still rename. Long-press is the touch path.
5. **OS steal:** below `md`, chip long-press must not open the browser context menu.
