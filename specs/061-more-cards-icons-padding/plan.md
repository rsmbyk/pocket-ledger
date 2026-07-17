# Plan 061: More cards padding + icons

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

More section cards need even four-side padding and clearer section identity via icons (after Net worth removal).

## Scope / edges

**In:** Backup, Recurring, Goals, Privacy — `p-(--card-spacing)` on Root + `px-0` on Header/Content; title icons HardDrive, Repeat, Target, Lock.

**Out:** Global Card primitive change; Net worth card (gone in 059).

## TDD

Playwright asserts icons / sections; no domain tests.
