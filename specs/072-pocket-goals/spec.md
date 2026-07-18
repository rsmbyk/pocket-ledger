# Spec 072: Pocket goals; retire Home/More goals

- **ID:** 072
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Attach **at most one optional goal** to each pocket. Achieved amount is the pocket’s **current derived balance**. Remove the Home goal strip and More **Goals** UI. Migrate legacy global goals onto Main (at most one).

## Scope

### In scope

1. Per-pocket optional goal: **target amount** (required if goal set); **target date optional**
2. UI on Pockets list/detail: achieved / target · percent on **one line**; when a target date is set, **time remaining on the next line**; then progress bar
3. Time remaining in the **largest calendar unit**: years, else months, else weeks, else days (define unit boundaries in domain tests)
4. Remove `home-goal-strip` and More section `more-section-goals` (create/list/delete)
5. Migration on upgrade: if legacy `goals` rows exist, set Main’s pocket goal from the **nearest deadline** goal (then clear or stop reading `goals` for UI); if Main already has a pocket goal, skip attach; extra legacy goals are not kept in the live goals UI

### Out of scope

- Multiple goals per pocket
- Goal “name” field (pocket name is enough) unless needed for backup compat — omit new names
- Daily pace / savedMinor UX

## Domain rules

- Achieved = `derivePocketBalance` for that pocket (071)
- Percent = same clamping as existing `goalProgressPercent` (0–100 based on max(0, balance))
- No target date → show achieved / target · % only (no time-remaining line)
- With target date: time remaining is a **separate line** under achieved/target/%; compute using largest unit from “today” to deadline; overdue → show overdue in same unit scheme (domain tests lock wording/sign)
- Clearing a pocket goal removes target fields without deleting the pocket

## Acceptance scenarios

### Scenario: Set goal without date

- **Given** a pocket with balance `30_000`
- **When** the user sets a goal target `100_000` with no date
- **Then** UI shows target, achieved `30_000`, and ~30%
- **And** no time-remaining line

### Scenario: Time remaining on next row

- **Given** a pocket goal with a target date and remaining time
- **When** the Pockets list row renders
- **Then** achieved / target · % appear on one line
- **And** the time-remaining text appears on the **following** line (not joined with `·` on the percent line)

### Scenario: Time remaining largest unit

- **Given** today and a goal deadline ~400 days out
- **When** time remaining is formatted
- **Then** it uses **years** (or months if under a year — locked by Vitest fixtures), not a raw day count alone

### Scenario: Home strip gone

- **Given** a pocket goal exists
- **When** Home renders
- **Then** there is no `home-goal-strip`

### Scenario: More Goals gone

- **Given** More panel
- **When** it renders
- **Then** there is no Goals section / create form

### Scenario: Migrate nearest goal to Main

- **Given** legacy goals with deadlines in 10 and 30 days and Main has no pocket goal
- **When** migration runs
- **Then** Main’s goal matches the 10-day target
- **And** global Goals UI remains absent

## Traceability

- Vitest: pocket goal progress; optional date; `largestRemainingUnit` helper; migration picker
- Playwright: set/clear goal on pocket; Home/More absence; migrate spot-check if feasible
- Implementation: account goal fields; `PocketsPanel`; remove strip/`MorePanel` goals; migrate in app bootstrap

## Related

- 060 (superseded for UI); 070; 071
