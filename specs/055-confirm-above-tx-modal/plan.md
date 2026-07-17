# Plan 055: Confirm above transaction modal

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Void/discard confirms use the same `z-50` stack as the transaction Dialog/Sheet, so ConfirmDialog can paint **behind** the tx modal and look broken / untappable.

## Scope / edges

**In:** Elevate ConfirmDialog overlay + content above tx modal/sheet (e.g. `z-[60]`).

**Out:** Changing Sheet/Dialog base z-index globally; Bits nesting API experiments.

## Approach

- Prefer ConfirmDialog-local elevation (pass higher z on overlay/content classes) so only confirms rise.
- If Dialog primitives don’t expose overlay class easily, elevate via ConfirmDialog wrapper classes on Content + matching Overlay override used only by ConfirmDialog.

## TDD

- Vitest: none
- Playwright: open edit → Void → confirm dialog visible and interactable above sheet

## Out of scope

Rewriting modal platform (041); portal host changes.
