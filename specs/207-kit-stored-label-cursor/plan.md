# Plan 207: Hex kit stored label cursor matches the checkbox

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Hovering **I stored this kit somewhere I can find it** uses the default arrow. Hovering the checkbox uses the control cursor. The wrapping label should match.

## Approach

`cursor-pointer` on the label and checkbox, matching Show voided. When the checkbox is disabled (202), the whole label uses `cursor-not-allowed`.
