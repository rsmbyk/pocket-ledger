# Plan 181: Debug fake signup (temporary)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119, 178, 180. Remove with spec 180 when this testing wave is done.

## Why

Cursor’s IDE browser cannot finish GIS popup (`gsi/transform` has no `window.opener`). Production Cloud Run has no `VITE_FAKE_GOOGLE`. Need a signed-out testing button so Settings can run new-user signup without Google. Not product. Delete this slice when testing is done.

## Approach

Fixed fake identity `pl-debug-cursor` (not a random UUID). Production API temporarily accepts only that `fake.*` sub via `AUTH_FAKE_SUB`. Signed-out Cloud Sync shows **Sign up with fake account** beside GIS. Sign-out of that user reuses spec 180 reset-and-sign-out (delete cloud user + cookie + IndexedDB). Real Gmail sign-out unchanged.

## Scope / edges

**In:** Fake-token allowlist, production API env, Settings button + confirm, wipe local before signup, wipe cloud on sign-out for this sub only, HOSTING exception.

**Out:** GIS redirect / One Tap, PRODUCT wipe-account, local `VITE_FAKE_GOOGLE` second button, GIS button theme (spec 182).
