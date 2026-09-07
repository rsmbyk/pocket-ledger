# Spec 231: Accept Description / Repeat chrome

- **ID:** 231
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Accept-mode Repeat is only for repeating Plans. Read-only Description and Repeat distinguish **title** from **value**.

## Scope

### In scope

1. Accept Repeat block only when stored frequency is Weekly or Monthly (full label, e.g. `Weekly (on Monday)`). Once: no Repeat section.
2. Accept Description and Repeat titles: muted (`text-muted-foreground text-sm`). Values: `text-base font-medium`. Empty description still “—”.
3. Edit / create: Repeat select and Description input unchanged.

### Out of scope

- Save for next visibility (224) / dirty (230)
- List chips (229)

## Domain / UI rules

- Supersedes 223 “accept always shows Repeat”.
- Pocket-details identity pattern: muted title, stronger value.

## Acceptance scenarios

### Scenario: Once has no Repeat

- **Given** accept mode on a Once Plan
- **When** the form renders
- **Then** there is no Repeat block
- **And** Description is still shown

### Scenario: Weekly shows Repeat

- **Given** accept mode on a Weekly Plan
- **When** the form renders
- **Then** Repeat shows the full option label
- **And** that value is visually stronger than the “Repeat” title
- **And** the Description value is visually stronger than the “Description” title

## Traceability

- Vitest: none required
- Playwright: `e2e/plans.e2e.ts` — Once accept no Repeat; Weekly accept shows Repeat; value vs title classes
- Implementation: `PlanSheet.svelte`

## Related

- 223, 224
