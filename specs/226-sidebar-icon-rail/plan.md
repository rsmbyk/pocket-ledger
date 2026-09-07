# Plan 226: Sidebar icon rail

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 013, 019, 160, 186

## What

On large screens the sidebar **collapses to an icon rail** instead of offcanvas-away. The brand animates down to toolbar height so nav icons start under that strip. Expanded brand is larger with more gap. Mobile overlay offcanvas stays.

## Why

013 locked `collapsible="offcanvas"` (not icon rail). Desktop now needs a persistent thin rail without losing the overlay drawer on small viewports.

## Out of this slice

- Changing nav items (223 order lands with Plans)
- New brand artwork
- Default collapsed
