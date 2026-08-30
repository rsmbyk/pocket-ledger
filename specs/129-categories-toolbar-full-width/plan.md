# Plan 129: Categories toolbar full width on small screens

## What

Below `md` (768px), **Add group** and **Reorder** fill the catalog width and share it equally. `md` and up stays hug-content, right-aligned.

## Why

On phones the two shrink-wrapped outline buttons sit on the right and look sparse. Spec 126 already uses `md` for Categories chrome.

## Scope

- Default-mode toolbar only (`category-add-group`, `category-reorder`)
- Equal two-column full width below `md`

## Out of this slice

- Reorder-mode Reset / Discard / Save
- 128 grid; 131 header actions

## Edges

1. **Phone (<768):** both buttons same width; together they span the catalog (same inset as search).
2. **Desktop (≥768):** unchanged — `justify-end`, intrinsic width.
