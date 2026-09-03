# Spec 171: Goal bar color steps

- **ID:** 171
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Goal progress fill is a stepped blend from expense red through yellow at 70% to income green at 100%.

## Scope

### In scope

1. Domain helper (name may vary) in `apps/web/src/lib/domain/goals.ts`: snap percent → stop; piecewise lerp **0→70** red–yellow, **70→100** yellow–green. Return a CSS color the bar can set (`color-mix` or equivalent from the three tokens).
2. Yellow midpoint: `--goal-mid` in `apps/web/src/app.css` (light + `.dark`), not `--primary`. Red is `--destructive` (expense / Brick). Green is `--income`.
3. Same fill on details rows and pockets-list preview (the 170 shared bar). Track stays `bg-muted`.
4. Percent **text** stays muted (170); do not recolor `97%`.

### Out of scope

- Layout (170)
- Past-goals modal (no bar)
- Home charts
- Other progress bars

## Domain / UI rules

- Filled **width** still follows the true clamped percent (97% wide at 97%).
- Fill **color** uses a quantized stop: `stop = percent >= 100 ? 100 : floor(percent / 10) * 10`.
- Buckets (inclusive): `0–9`, `10–19`, … `60–69`, **`70–79`**, `80–89`, `90–99`, then **`100` alone**. 65 uses the 60 color; 75 uses 70; 97 uses 90.
- Piecewise: at stop 0 the fill is `--destructive`; at stop 70 `--goal-mid`; at stop 100 `--income`. Between those, blend along that segment.

## Acceptance scenarios

### Scenario: Floor is expense red

- **Given** progress 0–9%
- **When** the bar renders
- **Then** fill is expense red (`--destructive`)

### Scenario: Mid is yellow

- **Given** progress 70–79%
- **When** the bar renders
- **Then** fill is the yellow stop (`--goal-mid`)

### Scenario: Full is income green

- **Given** progress 100%
- **When** the bar renders
- **Then** fill is income green (`--income`)

### Scenario: Width true, color snapped

- **Given** progress 97%
- **When** the bar renders
- **Then** fill width is 97%
- **And** fill color matches the 90–99 stop (same as 90%), not 100% green

## Traceability

- Vitest: `apps/web/src/lib/domain/goals.test.ts` — stop + blend at 0 / 65 / 70 / 90 / 100
- Playwright: none required (color); visual check on details + list
- Implementation: `goals.ts` helper; `--goal-mid` in `app.css`; bar background on the 170 shared fill

## Related

- 072 / 152 goal chrome
- 133 visual system (`--income`, `--destructive`)
- 170 Goal row stack
