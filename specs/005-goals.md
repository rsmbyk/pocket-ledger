# Spec 005: Goals

- **ID:** 005
- **Status:** Accepted

## Intent

Track savings-style goals with a target amount and progress toward that target.

## Scope

### In scope

- Create goal: name, target (positive minor units)
- Update saved progress (set saved amount)
- List goals with percent complete (capped at 100% display)
- Delete goal
- Surface on More tab

### Out of scope

- Auto-allocating from categories
- Multiple currency goals
- Shared household goals

## Domain rules

- `targetMinor > 0`, `savedMinor >= 0` integers
- Progress ratio = min(1, saved / target)

## Acceptance scenarios

### Scenario: Create goal and set progress

- **Given** More tab goals section
- **When** user creates “Emergency” target 1_000_000 and sets saved to 250_000
- **Then** the goal shows 25% progress

## Traceability

- Vitest: `src/lib/domain/goals.test.ts`
- Playwright: `e2e/goals.e2e.ts`
- Implementation: `src/lib/application/goals.ts`
