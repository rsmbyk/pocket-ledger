# Spec 234: Xl list + filter card columns

- **ID:** 234
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **xl** (≥1280), Transactions and Plans use a **top-level** two-column page: the first column is search, Add, the list, and (Transactions only) the date range; the second is the filter as a **card** that hugs its contents. Narrow viewports keep the sheet.

## Scope

### In scope

1. **Top-level split (≥1280, Transactions and Plans)** — under the page title bar, two columns fill the remaining inset. Chrome (`activity-chrome` / `plans-chrome`) lives in the **left** column with the list. The filter is the **right** column, not nested beside the list under a full-width chrome band.
2. **Left column** — Transactions: date range, search, Add Transaction, then the list. Plans: search, Add Plan, then the list. The Filters icon stays hidden on xl (058). Chrome stays visible while the left column’s list scrolls (142, scoped to this column).
3. **Right column** — existing always-on filter (`activity-filters-drawer` / `plans-filters-drawer`) as a **card** (Current+ / `--elev-card`, same family as Home cards). The card **hugs** header, fields, and footer — it does **not** stretch to the left column’s height. No Filters title; no Close; Clear and Apply remain (058).
4. **Card chrome** — Clear in the card header (right-aligned). Fields then Apply **stack tightly** under it (058 item 5, inside the card). Apply is the card footer, not pinned to the viewport bottom.
5. **&lt;1280** — unchanged: full-width chrome above the stage, Filters icon, sheet (bottom/right), title, Close, dirty-discard.
6. **Stage width** — xl still uses the full main inset (058), not a centered narrow island.

### Out of scope

- Filter criteria, draft vs Apply, live search, Clear semantics
- Changing the xl breakpoint (stays 1280)
- Restoring a visible “Filters” title
- Home, Pockets, Categories, pocket details

## Domain / UI rules

- Draft vs applied unchanged (045 / 049 / 223).
- Testids unchanged: `activity-chrome`, `plans-chrome`, `activity-filters-drawer`, `plans-filters-drawer`, search / Add / range / Clear / Apply.
- **Supersedes 142** “Wide layout: band spans the inset above the list + drawer” — on xl the band is the left column only.
- **Keeps 058** item 5 inside the card (header / fields / Apply stack at the top with no stretch). The **card** is the right-hand section; it does not fill the column.
- **Supersedes 049 / 058** geometry: the drawer is a sibling of chrome+list, not only of the list.
- Below 1280, 020 / 045 / 049 / 058 / 142 / 223 sheet + sticky full-width chrome still apply.

## Acceptance scenarios

### Scenario: Transactions columns on xl

- **Given** Transactions at viewport width ≥ 1280
- **When** the page renders
- **Then** `activity-filters-drawer` is visible as a card (not a `border-l` rail only)
- **And** `activity-filters-open`, `activity-filters-sheet`, and `activity-filters-close` are absent
- **And** `activity-chrome` (range, search, Add) sits in the left column with the list
- **And** the top of `activity-filters-drawer` aligns with the top of `activity-chrome` (not only with the list)
- **And** the card is shorter than the left column (content-sized, not stretched)

### Scenario: Plans columns on xl

- **Given** Plans at viewport width ≥ 1280
- **When** the page renders
- **Then** `plans-filters-drawer` is visible as a card
- **And** `plans-filters-open`, `plans-filters-sheet`, and `plans-filters-close` are absent
- **And** `plans-chrome` (search, Add) sits in the left column with the list
- **And** the top of `plans-filters-drawer` aligns with the top of `plans-chrome`
- **And** the card is shorter than the left column (content-sized, not stretched)

### Scenario: Apply stacks under the fields

- **Given** the always-on filter card on xl
- **When** it renders
- **Then** Clear is at the top of the card
- **And** Apply sits immediately under the fields (no empty stretch between them)

### Scenario: Chrome stays while the list scrolls

- **Given** Transactions on xl with enough rows to scroll
- **When** the user scrolls the list
- **Then** the date trigger, search, and Add Transaction remain visible under the title bar
- **And** the filter card stays in place

### Scenario: Narrow viewport unchanged

- **Given** Transactions or Plans at viewport width &lt; 1280
- **When** the user opens Filters
- **Then** the sheet still opens with Close and dirty-discard as today
- **And** chrome still spans the inset above the list (no persistent filter card column)

## Traceability

- Vitest: none
- Playwright: `e2e/activity-filters.e2e.ts` (extend the 1280 describe); `e2e/plans.e2e.ts` (xl drawer geometry)
- Implementation: `apps/web/src/lib/ui/AppShellChrome.svelte`

## Related

- 049 (in-layout drawer), 058 (always-on xl; stack-at-top kept inside the card), 142 (sticky chrome; full-width xl band superseded here), 223 (Plans page chrome)
