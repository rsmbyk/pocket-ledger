# Plan 119: Google Sign-In, account passphrase, hex kit, session manager

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 115 product; Spec 120 wrapping (DEK boxes); Spec 121 sync after unlock

## Why

Signed-in mode needs Google identity, a mandatory account passphrase, a hex recovery kit, resumable onboarding, and session revoke. Device-lock skip warning, typed lockout ladder, WebAuthn, and screensaver/idle live here as lock UX (wrapping math is Spec 120). If 120 is not yet Accepted, 119 must not ship money sync — only gates and session.

## Approach

GIS on web; Hono verifies ID token; 7-day rolling HttpOnly Secure cookie on API host; CORS. Distinct device vs account lock UIs. Onboarding pipeline must finish; persist incomplete server state (no recovery wrap until kit confirm). Session list + revoke.

## Scope / edges

**In:** Google, passphrase/kit UX, resume, cookie, CORS, session manager, replace-device-passphrase notify.

**Out:** Sync pull/push/409 (121); encrypted file backup (120) except hiding export while signed in if 120 already shipped; Android.
