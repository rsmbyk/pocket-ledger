# Plan 239: Xl column scroll + card shadows

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 235, 238, 234

## What

Home and pocket-details xl columns actually scroll, and card elevation is not clipped at the column edges.

## Why

CSS grid implicit rows stay as tall as the cards, so `overflow-y-auto` never runs and the stage clips. The same overflow clips `--elev-card` into hard corners.

## Out of this slice

- Column membership, 1280 breakpoint
- Transactions/Plans xl (already flex)
