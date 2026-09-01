# Plan 133: Visual system (Mist / Ink / Figtree)

## What

Bake the locked look from the local preview overlay into product CSS and chrome so `dev`, preview, and production match: Mist surfaces, Ink primary, Figtree, 7px radius, Current+ card elevation, Brick money/charts/danger, Soft chart hover, Lift sheets, Quiet focus, overlay-fade scrollbars, and equal button height at every viewport (the former desktop size).

## Why

The overlay was a lock-in tool. Shipping still used zinc / Inter / 10px radius. Ronald asked to implement the locked choices.

## Scope

- Tokens in `apps/web/src/app.css` (light + dark)
- Figtree via `@fontsource-variable/figtree`; drop Inter
- Card / balance-hero / sheet / dialog elevation
- `--income` + Brick `--destructive`; money and chart classes
- Quiet `:focus-visible`; overlay scrollbars globally
- Labeled Button `default` / `sm` / `lg` → `h-9`; icon → `size-9`; icon-sm → `size-8`; icon-lg → `size-10` (no mobile bump)
- PWA / `theme-color` follow Mist
- Remove `PalettePreviewBar`

## Out of this slice

- Pocket Ledger kit layer wrapping shadcn (`lib/ui/kit`)
- Snug density (library spacing stays)
- Empty-state rewrite
- Android
