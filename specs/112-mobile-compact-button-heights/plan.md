# Plan 112: Mobile compact button heights

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens / follows:** Spec 111 (primary controls `h-11` below `md`; compact sizes left dense)

## Why

Spec 111 made `default` / `icon` buttons taller on mobile, but most chrome actions use **`sm` / `icon-sm`** (`h-8` / `size-8` = 32px): header, filters, month arrows, category/pocket icon rows, theme menu, sheet/dialog close. Those still feel too small on phones.

## Approach

- Below `md` only: bump **`sm` → `h-10` (40px)** and **`icon-sm` → `size-10` (40px)**
- From `md` up: keep current `h-8` / `size-8`
- Leave **`xs` / `icon-xs`** alone (dense micro controls)
- Keep Spec 111 primary hierarchy: mobile `sm` (40) &lt; `default` (44) &lt; `lg` (48)

Change only [`button.svelte`](../../src/lib/components/ui/button/button.svelte) size variants — call sites already pass `size="sm"` / `size="icon-sm"`.

## Out of this slice

- `xs` / `icon-xs`
- Input / tabs / field chrome (already covered by 111)
- Desktop denser/taller changes
- New tokens or deps
