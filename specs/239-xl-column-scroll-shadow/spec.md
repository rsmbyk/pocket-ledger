# Spec 239: Xl column scroll + card shadows

- **ID:** 239
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On xl, Home and pocket-details columns **scroll independently** when their cards overflow. Card elevation (`--elev-card`) is fully visible — no clipped corners.

## Scope

### In scope

1. Home xl columns (`home-col-summary`, `home-col-lists`).
2. Pocket details xl columns (`pocket-details-col-identity`, `pocket-details-col-activity`, `pocket-details-col-lists`).
3. Height chain so each column has a bounded box and `overflow-y-auto` works (flex + `min-h-0`, not a CSS grid auto row).
4. Inner padding on the scrollport so `--elev-card` is not clipped.
5. Stage still does not scroll. Title bar stays put.

### Out of scope

- Who sits in which column (235 / 238)
- Changing the xl breakpoint
- Transactions / Plans / Categories scroll

## Domain / UI rules

- **Supersedes 235 / 238** only for scroll + shadow painting. Equal-width columns and card order stay.
- Same overflow pattern as Transactions xl (234): flex row, `flex-1 min-w-0 min-h-0`, column `overflow-y-auto`.
- The scrollport is a block box (not `flex-col`), so cards keep their height and the column scrolls. Cards sit in an inner `gap-4` stack.
- Padding on each scroll column is enough for `--elev-card` (~12px).

## Acceptance scenarios

### Scenario: Home lists column scrolls

- **Given** Home at ≥1280 with enough Recent rows to overflow the lists column
- **When** the user scrolls `home-col-lists`
- **Then** that column’s `scrollTop` increases
- **And** `home-col-summary` does not scroll
- **And** `page-title` stays visible

### Scenario: Pocket details column scrolls

- **Given** pocket details at ≥1280 with enough Recent rows to overflow `pocket-details-col-activity`
- **When** the user scrolls that column
- **Then** its `scrollTop` increases
- **And** the other two columns do not scroll
- **And** `page-title` stays visible

### Scenario: Card shadow is not clipped

- **Given** Home or pocket details on xl
- **When** a card in a column renders
- **Then** the card’s box sits inset from the column’s client box (column padding)
- **And** the elevation is not cut off at the column edge

## Traceability

- Vitest: none required
- Playwright: `e2e/desktop-layout.e2e.ts`; `e2e/pocket-details.e2e.ts`
- Implementation: `AppShellChrome.svelte` Home xl; `PocketDetailsPanel.svelte` xl

## Related

- 234, 235, 238
