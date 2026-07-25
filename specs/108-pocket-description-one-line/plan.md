# Plan 108: Pocket description one-line

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Add/Edit pocket Description uses a multiline textarea. Ronald wants a single-line field.

## Approach

Replace the pocket form `Textarea` with the existing shadcn `Input`. Keep label, placeholder, `data-testid`, and `formNotes` / `notes` wiring unchanged.

## TDD

Presentation-only. Light Playwright assert that the description control is an `input`, not a `textarea`.
