# Plan 206: Default pocket can take Main beside a sibling Main

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Spec 201 allows a non-Main pocket named Main only while the default pocket is unnamed. After the default pocket has a custom name, renaming it to Main is treated as taken. Restoring the fallback (typed Main or empty) must still succeed.

## Approach

`assertUniquePocketName` skips the clash when `except` is the default pocket and the proposed name is the Main fallback. Keep two non-Main Mains colliding.
