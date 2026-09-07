# Plan 227: Sidebar rail at sm

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 013, 226

## What

The persistent inset sidebar and Spec 226 icon rail start at Tailwind **`sm` (640px)** instead of **`md` (768px)**. Overlay drawer only below 640px.

## Why

751px (and the rest of 640–767) currently opens a sheet overlay. That width should collapse to the icon rail.

## Out of this slice

- Other `md` cuts (tx/plan dialog vs sheet, Categories, filters)
- Default collapsed
- Collapsed label/centering (228)
