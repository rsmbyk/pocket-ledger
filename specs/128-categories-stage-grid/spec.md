# Spec 128: Categories stage-width grid

- **ID:** 128
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Categories group cards and chips follow the **catalog stage** width so tablet + open sidebar does not squeeze two groups into ~500px. Prefer a second group column before a third chip column. There is no cap on group columns.

## Scope

### In scope

1. **Stage, not viewport** — Group columns and chip columns are derived from the catalog container (and each group card), not `sm` / `xl` viewport breakpoints.
2. **Chips — max 3** — Each group uses the highest of 1 / 2 / 3 chip columns that fit the card. If 2 fit, skip 1. If 3 fit, skip 1 and 2.
3. **Groups — unlimited** — As many group cards on one row as the catalog can fit (`auto-fill`).
4. **Priority** — Fill to **2 chips**, then add a group column. Do **not** use 3 chips while another 2-chip-wide group would still fit. 3 chips only when leftover width stretches a card to **C3** and another group would not fit.
5. **Reorder** — Unchanged: one column of group names (125/127).

### Out of scope

- Toolbar Add group / Reorder layout (129)
- CategoryPicker search (130)
- Group header eye / rename / hover (131)
- Activity filter used-categories (132)
- Spec 126 chip tap/hover hide-edit
- Android

## Domain / UI rules

Root font 16px. Locked tracks (tune only with a spec update):

- **C2** = `22rem` (352px) — min width for two chip columns; catalog `auto-fill` min track
- **C3** = `32rem` (512px) — min card width for three chip columns

Catalog grid: `repeat(auto-fill, minmax(min(100%, 22rem), 1fr))` so a second column appears at **2 × C2** (704px catalog), before a lone group would sit at C3. `min(100%, 22rem)` lets one group shrink on a phone.

Chip list inside each card: 1 column below C2, 2 from C2, 3 from C3. Never more than 3.

Measured iPad-width **834px** with sidebar open (16rem): catalog ~498px → **1 group × 2 chips**.

## Acceptance scenarios

### Scenario: Tablet sidebar does not clip chip labels

- **Given** Categories Income, viewport **834×1112**, sidebar **open**
- **When** the Work group card is shown
- **Then** the catalog has **one** group column
- **And** chips in Work are **two** columns
- **And** the Commission chip label is not truncated with an ellipsis

### Scenario: Second group before third chip

- **Given** Categories, catalog width **≥ 704px** and **< 1024px** (2 × C2, each card still below C3)
- **When** the group grid is measured
- **Then** there are **at least two** group columns
- **And** chips in those cards are **two** columns, not three

### Scenario: Skip one chip when two fit

- **Given** a single group card whose inner width is **≥ C2** and **< C3**
- **When** chips render
- **Then** there are two chip columns (not one)

### Scenario: Three chips only as leftover

- **Given** a group card whose inner width is **≥ C3** and the catalog cannot fit another C2 min-track
- **When** chips render
- **Then** there are three chip columns

### Scenario: Wide stage can exceed three groups

- **Given** a catalog wide enough for four C2 min-tracks
- **When** the group grid is measured
- **Then** there are **four** group columns (not capped at 3)

### Scenario: Reorder is still a single column

- **Given** reorder mode
- **When** group rows are listed
- **Then** they are one column of names (127 gap rules still apply)

## Traceability

- Vitest: none required (layout CSS); optional helper only if thresholds are extracted
- Playwright: `e2e/categories.e2e.ts` (834px + sidebar: 1 group column, 2 chip columns, Commission not ellipsized); `e2e/desktop-layout.e2e.ts` or same file (wide catalog: >3 group columns)
- Implementation: `apps/web/src/lib/ui/CategoriesPanel.svelte` catalog grid + chip `ul`
- Docs: this folder; `specs/README.md` index
- Depends on: 013, 123, 124
- Related: 126 (do not change chip gestures)

## Related

- 013 sidebar 16rem; 124 group cards + `grid-cols-2` chips
