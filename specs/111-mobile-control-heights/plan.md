# Plan 111: Mobile control heights

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 039 (tx type controls moved off oversized `h-12` to compact `h-9`); Spec 013 (sidebar nav `lg` / 48px — unchanged)

## Why

Primary interactive controls are **`h-9` (36px)** on every viewport — buttons, inputs, input groups, tabs, and app “select” chrome. That is tight for fingers on phones. Inputs already use `text-base` → `md:text-sm` to avoid iOS zoom, but there is **no** taller mobile control / touch-target pattern.

## Approach

- **Breakpoint:** below Tailwind `md` only; `md+` keeps current heights.
- **Target:** **`h-11` (44px)** for primary controls (common touch-target guidance). Not `h-12` — Spec 039 already rejected oversized type controls.
- **Mechanism:** responsive Tailwind on shared primitives (`h-11 md:h-9`, `size-11 md:size-9`), plus the same classes on app chrome that hardcodes `h-9`.
- **Compact sizes stay dense:** `xs` / `sm` / `icon-xs` / `icon-sm` unchanged (dense toolbars / icon rows). Sidebar nav `lg` → `h-12` left alone.

## Scope / edges

**In:**

- Button `default` + `icon` (and `lg` / `icon-lg` if hierarchy would otherwise invert on mobile)
- Input, InputGroup root
- Tabs list (triggers fill the list)
- App chrome with hardcoded `h-9`: CategoryPicker, DateField, QuickAdd pocket/type triggers, AppShell filter chrome

**Out:**

- Compact button sizes, dropdown item padding, textarea `min-h`, sidebar menu heights, header `h-14`
- Desktop (`md+`) denser/taller changes
- New deps or height design tokens

## Out of this slice

- Changing Spec 039 type-control _semantics_ beyond inheriting the shared mobile height bump
- Reworking layout spacing beyond control height
