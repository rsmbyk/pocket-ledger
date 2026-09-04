# Spec 186: Sidebar Google profile

- **ID:** 186
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Signed-in sidebar footer shows Google picture, display name, and email. Click remains a no-op. Supersedes Spec 160 “no avatar.”

## Scope

### In scope

1. `verifyGoogleToken` returns `name` and `picture` from tokeninfo; fake tokens use email local-part and no picture.
2. `users.display_name` / `users.picture_url`; refresh on each `ensureUser`.
3. `/v1/me` and auth `user` include `displayName` and `pictureUrl`.
4. Sidebar footer: ~32px circle avatar + name + muted truncated email. `data-testid="sidebar-account"`.

### Out of scope

- Account switcher, click-to-Settings
- Caching image bytes

## Acceptance scenarios

### Scenario: Fake Google shows name and initials

- **Given** fake Google sign-in
- **When** the shell is visible
- **Then** `sidebar-account` shows the email local-part as the name, the email, and initials (no broken image)

## Traceability

- Vitest: `apps/api/src/verify-google.test.js`; `apps/web/src/lib/application/google-profile.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: verify-google, schema, stores, AppShellChrome
