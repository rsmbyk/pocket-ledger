# Plan 140: Voided hidden by default; Show voided

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Transactions hide voided rows by default. The filter control is **Show voided**.

## Why

Voided rows are noise on a mutation list. Opting in is the extra, not hiding.

## Scope

- Default / Clear: hidden
- Label Show voided; badge when checked
- Session coerce from old `hideVoided`

## Out of this slice

- Home Recent voided
- Void row chrome
