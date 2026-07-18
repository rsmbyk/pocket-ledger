# Spec 088: Tabs active indicator

- **ID:** 088
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Active Normal | Transfer tab is visually distinct (raised background / shadow) on default Tabs list chrome.

## Scope

### In scope

1. Bridge `data-active` Tailwind variant to `[data-state='active']` (and existing `data-active` attrs) in `src/app.css`
2. No change to tab behavior or testids
3. Hardens Spec 081 visual acceptance

### Out of scope

- Income / Expense button chrome
- Redesigning tab look beyond making existing default styles apply

## Acceptance scenarios

### Scenario: Raised active

- **Given** Add transaction with Normal | Transfer tabs
- **When** Normal is selected
- **Then** `tx-mode-normal` has `data-state="active"` and shows raised default chrome vs Transfer
- **When** the user selects Transfer
- **Then** `tx-mode-transfer` is active and transfer fields show

## Traceability

- Playwright: pockets / transfer tab smoke
- Implementation: `src/app.css`
- Hardens: 081

## Related

- 081, 073
