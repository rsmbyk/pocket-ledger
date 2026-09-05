# Plan 197: Unique pocket names; Main is the default label

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Duplicate pocket names are allowed. Main is filled in as if it were a custom name.

## Approach

Case-insensitive unique names. Main is the display fallback for the unnamed default pocket; the Name field starts empty with placeholder Main.
