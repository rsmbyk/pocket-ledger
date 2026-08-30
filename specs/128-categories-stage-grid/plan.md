# Plan 128: Categories stage-width grid

## What

Drive Categories group and chip columns from **stage (catalog) width**, not the viewport. Fill chips to 2, then add as many group columns as fit. A 3rd chip column only when leftover width cannot fit another group.

## Why

`sm:grid-cols-2 xl:grid-cols-3` keys off the window. On tablet (`md`+) with the sidebar open (16rem), the stage is ~500px while the viewport still forces two groups, so chips sit at ~105px and labels clip. Phone overlay nav is not the bug.

## Scope

- Catalog `auto-fill` with min track **C2** (2-chip card width)
- Per-card container queries: 1 / 2 / 3 chip columns (max 3); skip lower if a higher fits
- Unlimited group columns
- Reorder list stays one column of names (125/127)

## Out of this slice

- 129 toolbar full-width; 130 picker search; 131 header actions
- Viewport `sm`/`xl` as the catalog contract
- Chip hide/edit (126)

## Edges

1. **Tablet + sidebar (~834px, sidebar open):** 1 group column, 2 chip columns; labels such as Commission are not clipped.
2. **Two C2 tracks:** catalog wide enough for two min-tracks, not enough leftover for C3 on a single card → 2 groups × 2 chips, not 1 × 3.
3. **Phone:** one group; 1 or 2 chips from card width vs C2 (may skip 1 chip).
4. **Wide:** more than 3 group columns allowed.
