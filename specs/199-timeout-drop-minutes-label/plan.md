# Plan 199: Drop Minutes label under Timeout

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Timeout plus Minutes is redundant; the control already says “30 minutes.”

## Approach

Remove the Minutes label. `aria-label="Timeout"` on the trigger.
