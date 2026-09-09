# Plan 245: Shell loading skeletons

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 221, 013, 148, 149, 151, 154, 234, 235, 238
- **Related:** 000 scaffold shell

## Why

Cold boot is a full-viewport spinner, then the dashboard appears at once. Unlock sets `unlocked` before ledger refresh, so Home can paint empty (no month card, empty lists) and then pop in. Route-shaped placeholders keep chrome stable while session/ledger (or the Home month cursor) is still waiting.

## Approach

Split `ready` into **session** vs **ledger**. Spinner (221) only while the session is unknown. Once the session is a shell (not a gate), mount sidebar + header and fill the stage with a destination-matching skeleton until `refreshLedger` finishes. Nav during that wait switches which skeleton is shown. Home month prev/next keeps the card chrome and pulses the body. No artificial delay when the destination is already ready. Background sync does not re-skeleton.

Shared `Skeleton` pulses; one `ShellStageSkeleton` per `AppRoute` (plus pocket details). Helper `shouldShowShellSkeleton` owns the gate.

## TDD

Red Vitest `shell-loading.ts` + skeleton component tests; then App/shell wiring; Playwright asserts skeletons are gone after boot and the month card does not vanish on prev/next.
