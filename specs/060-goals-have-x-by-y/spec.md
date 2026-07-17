# Spec 060: Goals — have X by Y

- **ID:** 060
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Redesign Goals into deadline reminders: **have target X by date Y**, with progress from the Main account balance and visible time remaining. Surface the nearest goal on Home when any goals exist.

## Scope

### In scope

1. Goal fields: **name**, **target X** (`targetMinor`), **deadline Y** (`targetOn` `YYYY-MM-DD`)
2. Progress = Main `balanceMinor` / X (display capped at 100%); remaining money; days left / overdue; rough need-per-day when useful
3. Multiple goals; list sorted **nearest deadline first** (tie: higher remaining)
4. Stop using hand-edited `savedMinor` for progress (stop writing for product behavior)
5. **Home strip** between Balance and Month summary when ≥1 goal; show nearest; tap → `#/more`
6. **Zero goals** → no Home strip/section at all
7. Create/edit/delete on More Goals card

### Out of scope

- Auto funding from transactions/categories
- Hiding More Goals card when empty (needed to create first goal)

## Domain rules

- `targetMinor > 0`; `targetOn` valid `YYYY-MM-DD`
- Progress ratio = min(1, max(0, balanceMinor) / targetMinor) for display percent (define overfunded remaining ≤ 0)
- `daysRemaining(targetOn, today)` — integer days; negative = overdue
- `dailyPaceNeeded(remainingMinor, days)` — only when remaining > 0 and days > 0
- `sortGoalsByNearestDeadline(goals, balance)` — ascending `targetOn`, then remaining desc

## Acceptance scenarios

### Scenario: Create have-X-by-Y

- **Given** More Goals
- **When** the user creates a goal with name, target, and deadline
- **Then** it appears with progress from current Main balance and time left (not a Set saved control)

### Scenario: Progress follows balance

- **Given** a goal target 100_000 and balance 25_000
- **When** Goals render
- **Then** progress shows 25% (or equivalent) toward the target

### Scenario: Nearest deadline first

- **Given** two goals with different `targetOn`
- **When** More list (and Home strip) render
- **Then** the sooner deadline is first / shown on the strip

### Scenario: Home strip only when goals exist

- **Given** zero goals
- **When** Home renders
- **Then** no goal strip/section is present
- **Given** at least one goal
- **When** Home renders
- **Then** the strip appears between Balance and Month summary

### Scenario: Overdue

- **Given** a goal whose deadline is before today
- **When** it renders
- **Then** time UI indicates overdue (not positive days left)

## Traceability

- Vitest: `src/lib/domain/goals.test.ts`, `src/lib/application/goals.test.ts`
- Playwright: `e2e/goals.e2e.ts` (new); update/remove old goal case in `e2e/base-features.e2e.ts`
- Implementation: `goals` domain/app, `MorePanel.svelte`, `AppShellChrome.svelte`, `App.svelte` as needed

## Related

- Supersedes Spec 005 progress model
- Spec 059 (More without Net worth)
