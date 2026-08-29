# Plan 124: Categories kind tabs, search, hover chips

## What

Rebuild `/categories` chrome so one **kind** is on screen at a time. Centered Income | Expenses tabs (Income default, session-remembered), full-width stage, a search field that filters groups and chips by label, toolbar with iconed Add group + Reorder (no page-level Edit), and **one card per group** whose chips show hide/edit only on hover.

## Why

The overlay catalog (Spec 123) lists ~140 stock chips. Showing Income and Expense together made the page too long and hard to scan. Tabs + search + hover actions keep the catalog on one viewport without a global edit mode.

## Scope

- Kind tabs (Income green-tint, Expenses red-tint); sessionStorage for the selected kind
- Categories stage uses the full content width (`max-w-3xl` off)
- Search filters group names and category names of the selected kind
- Add group + Reorder with icons; remove Edit mode
- Group cards: header = group name + add-plus; chips wrap inside
- Chip hover: show/hide for all; pencil edit for custom only; shown chips slightly raised
- Reorder still group-only, **selected kind only**
- Keep viewport-tall scrolling (tabs/search/toolbar stay; cards area scrolls)

## Out of this slice

- Overlay/catalog/migrate/picker rules (123)
- Custom icon picker, deleting/renaming groups, category DnD
- Persisting search text
- Transaction form CategoryPicker chrome

## Edges

1. **First open:** Income. Same tab session: Expenses stays after leaving Categories and coming back, and after reload. New tab / closed tab → Income again.
2. **Add group** uses the selected tab’s kind (no kind dropdown).
3. **Search:** case-insensitive substring. Group name match → whole group. Category name match → that group with only matching chips. Empty query → all groups of the kind. No matches → empty state, not a blank hole.
4. **Hover vs keyboard/touch:** actions visible on pointer hover **or** `:focus-within` (keyboard and tap can still hide/show/edit).
5. **Rename:** pencil enters inline rename on that chip; stays until save or discard even if the pointer leaves. Stock has no pencil.
6. **Hidden chips** stay listed (123), not raised, still hover-show.
7. **Dirty reorder + tab change:** same leave confirm as navigating away; leave discards the draft then switches kind.

## Supersedes (Categories page chrome only)

- 021 two kind-columns / Income-before-Expense on the same screen
- 123 “add chip at end of each group” and “page-level edit mode” on Categories
- 123 desktop two-column Income | Expense grid

Picker, overlay, and reorder *domain* stay 123.
