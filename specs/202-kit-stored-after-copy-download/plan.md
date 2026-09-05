# Plan 202: Kit stored checkbox after Copy or Download

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Continue already waits on the stored checkbox, but the checkbox can be ticked without Copy or Download.

## Approach

Disable `hex-kit-stored` until `copied` or `downloaded`. Do not auto-check.
