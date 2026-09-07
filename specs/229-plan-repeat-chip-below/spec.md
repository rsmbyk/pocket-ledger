# Spec 229: Plan Repeat chip below description

- **ID:** 229
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On Plan lists, the Repeat chip sits **under** the description. Amount, pocket, and chevron are vertically centered on **tx notes through date**, not on the header + tx stack.

## Scope

### In scope

1. Weekly / Monthly chip (word + icon, not “on Monday”) below the description. Once: no chip.
2. Empty description + Weekly/Monthly: chip is the only header block (no blank description line).
3. When a `header` snippet is present: header full width; inner row is tx-info | amount/pocket | chevron with `items-center`.
4. All three lists that use `PlanListRow` (Home, pocket details, `/plans`).
5. Testids unchanged (`*-header`, `*-description`, `*-repeat`).

### Out of scope

- Repeat field, Save for next, accept/edit
- Home Recent and Transactions (no header)

## Domain / UI rules

- Supersedes 224 “chip on the row header” as an inline flex row.
- Chip copy still Weekly / Monthly only.

## Acceptance scenarios

### Scenario: Chip under description

- **Given** a Monthly Plan with description “88787”
- **When** any Plan list renders the row
- **Then** the description is on its own line
- **And** the Monthly chip is on the next line under it
- **And** a Once Plan has no chip

### Scenario: Amount aligns to tx chrome

- **Given** a Plan row with a description/chip header
- **When** the row renders
- **Then** the amount column’s vertical midpoint matches the tx-info block (note / type / date)
- **And** it is not centered on the full item including the header

## Traceability

- Vitest: none required
- Playwright: `e2e/plans.e2e.ts` — chip below description; amount vs tx-info bbox
- Implementation: `PlanListRow.svelte` header `flex-col`; `TransactionListRow.svelte` when `header` is set

## Related

- 223, 224
