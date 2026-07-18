# Plan 085: Dirty outside discard fix

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 080

## Why

When dirty, `interactOutsideBehavior="ignore"` keeps the sheet open but bits-ui **does not call** `onInteractOutside`, so discard never opens on overlay tap.

## Approach

Keep host from closing when dirty; **separately** open discard on overlay/outside (e.g. overlay pointer handler, or `close` + sync refuse-open + discard so the callback path fires). Escape/Close stay prevent-then-warn. Playwright: overlay → discard + sheet present.

## TDD

Playwright dirty → click overlay → `tx-discard-confirm` + sheet still open.
