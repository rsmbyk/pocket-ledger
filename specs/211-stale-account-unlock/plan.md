# Plan 211: Stale account unlock after the session is gone

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

A tab that still thinks it is signed in keeps **Unlock your account**. If another tab already signed out (cookie gone, IndexedDB rebuilt, local device passphrase set), this tab’s wrap fetch returns 401 and Unlock prints the raw API code `unauthorized`.

## Approach

A dead session is local-only. Drop cloud identity and reload so Dexie matches the other tab. Then device unlock (if lock is on) or the signed-out app. Never show API error codes on Unlock. Detect on wrap/unlock 401, on tab visible + `fetchMe()` null, and on a sign-out storage ping so sibling tabs do not wait for a click.
