# Plan 203: Path URLs for lock, onboarding, recovery, reset

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Full-screen gates share `/` (Spec 191). The address bar should name the gate.

## Approach

Mirror app gate state to path URLs with replace navigation. Stub Kit routes for the static adapter. State stays the source of truth.
