# Plan 156: Settings idle screensaver

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 154

## What

Move idle minutes + leave-tab out of Privacy onto **Idle Screensaver**. Draft + Save / Cancel / Default (30 min, leave-tab on). Dropdown always shows the stored minutes, including 30. Persist only on Save (no live-apply).

## Why

Idle is its own concern. Live-apply made Cancel impossible.

## Out of this slice

- Screensaver overlay copy; WebAuthn
