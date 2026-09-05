# Plan 201: Main is a fallback, not a reserved name

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Spec 197 reserved Main so a second pocket could not use that string. Main is only the display fallback when the default pocket has no custom name.

## Approach

Drop the reserved-Main throw. Uniqueness skips `isUnsetMainName` pockets. Custom name collisions still fail.
