# Plan 080: Dirty modal keep-open on discard

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 044 (outside = close; dirty → discard; decline keeps open)
- **Related:** 045 (filters discard), 055 (confirm above modal)

## Why

Dirty outside-click opens the discard confirm but the host modal closes first. Cancel leaves parent `open === true` while the UI is closed, so later Add/Edit no-ops and other modals feel blocked (body lock / stuck open).

## Scope / edges

**In:** Prevent parent close, then show discard; audit dirty-guarded dismiss paths; Playwright cancel-then-reopen.

**Out:** Inline field errors (079); changing discard copy; removing outside-click-to-close.

## Approach

**Preferred (Ronald):** prevent the parent modal from closing first, then show the discard confirm — do not close-then-reopen.

1. On dirty dismiss: `preventDefault` on interact-outside / Escape so the host never starts closing; refuse applying `open = false`
2. Then open the discard ConfirmDialog on top
3. Confirm discard → allow host close; cancel → host was never closed

Activity filters’ keep-open intent is right; lead with **prevent close**, not “reassert after close.”

## TDD

- Playwright: dirty outside → host never unmounts + confirm on top; cancel → sheet open; clean close then reopen Add works
