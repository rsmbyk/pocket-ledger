# Plan 161: Currency picker labels

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 155

## What

Currency picker rows are ISO (monospace) plus English name. Drop the trailing ` - Symbol`.

## Why

The hyphen-symbol suffix is noisy (often repeats the ISO). Monospace ISO is easier to scan.

## Out of this slice

- FX / `formatMinor` money chrome
- Idle dropdown chrome (162)
