# Spec 233: Plan Due not in the past

- **ID:** 233
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Create and edit **Due** cannot select a past calendar day. Already-past Due is kept until the user changes it. Accept **Date** can be in the past.

## Scope

### In scope

1. Create/edit Due `DateField` native `min` = `todayOccurredOn()`.
2. Open an overdue Plan: Due stays as stored (no auto-bump).
3. Accept-mode Date: no `min` (late occurrence).

### Out of scope

- Transaction `occurredOn` / Add Transaction date
- Changing Home window (`today-7` still includes overdue)

## Domain / UI rules

- Picker constraint only unless the user picks a new Due; then the new value is ≥ today.
- DateField already supports `min`.

## Acceptance scenarios

### Scenario: Create Due min

- **Given** Add plan
- **When** the Due field renders
- **Then** the native date input `min` is today
- **And** a day before today cannot be chosen

### Scenario: Existing overdue

- **Given** a Plan whose Due is before today
- **When** the user opens edit
- **Then** Due still shows that past day until they change it

### Scenario: Accept Date

- **Given** accept mode
- **When** Date renders
- **Then** it has no min of today (past posting dates remain allowed)

## Traceability

- Vitest: none required
- Playwright: `e2e/plans.e2e.ts` — create/edit Due `min` is today
- Implementation: `PlanSheet.svelte` Due `min={todayOccurredOn()}` when not accept

## Related

- 220, 223
