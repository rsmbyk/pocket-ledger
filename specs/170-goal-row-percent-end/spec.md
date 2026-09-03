# Spec 170: Goal row amounts, date, percent, bar

- **ID:** 170
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Active goal chrome is four lines: amounts, date, right-aligned percent, bar. Details list and pockets-list preview match.

## Scope

### In scope

1. Details active rows (`pocket-details-goals-list`) and pockets list preview: the same stack. Prefer one shared snippet/component so they cannot drift.
2. Line 1: `formatMinor(current) / formatMinor(target)` — drop `· {percent}%`. Hide-amounts (048 / 089) still hides money.
3. Line 2: `{formatOccurredOnDisplay(targetOn)} ({formatRemainingUnit(...)})` when dated. List must include the date, not remaining-only. Omit this line when there is no `targetOn` (072).
4. Line 3: `{percent}%` right-aligned, muted `text-xs tabular-nums`.
5. Line 4: existing bar (`h-1.5`, fill width = percent). Fill **color** stays 072/`bg-primary` until 171.
6. Optional description title above line 1 stays on details (152). List preview has no description title.

### Out of scope

- Past goals modal (152: no bar, no percent)
- Progress math; sort; Drop; Home
- Stepped bar color (171)

## Domain / UI rules

- Percent is its own row, not on the amounts line and not sitting on the fill.
- Pockets list preview still shows the first active goal (152). Layout of that preview matches details.

## Acceptance scenarios

### Scenario: Dated goal, both surfaces

- **Given** an active dated goal at 97%
- **When** the details row and the pockets-list preview render
- **Then** line 1 is current / target with no percent
- **And** line 2 is the goal date and remaining in parentheses
- **And** line 3 is `97%` right-aligned
- **And** line 4 is the progress bar

### Scenario: No date

- **Given** an active goal with no date
- **When** either surface renders
- **Then** there is no date line
- **And** amounts, then right-aligned percent, then bar

## Traceability

- Vitest: none (layout)
- Playwright: `e2e/goals.e2e.ts` / `e2e/pockets.e2e.ts` — amounts line has no `· 25%`; percent still visible
- Implementation: shared goal-progress block; `PocketDetailsPanel.svelte`; `PocketsPanel.svelte`

## Related

- 072 Pocket goals
- 152 Pocket multi-goals
- 171 Goal bar color steps
