# Spec 208: GIS button never personalizes

- **ID:** 208
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The official Sign in with Google button always shows the generic **Sign in with Google** label. It must not switch to **Sign in as XXX** for returning users.

## Scope

`google.accounts.id.renderButton` `size` in `google-signin.ts`. Official GIS widget stays (179). Theme outline / outline_dark stay (182). `disableAutoSelect` / `auto_select: false` from 205 stay. Fake Google unchanged. No One Tap `prompt()`. No Playwright GIS iframe asserts.

Spec 205 does not stop personalization; this slice does.

## Acceptance scenarios

### Scenario: Medium size, not large

- **Given** GIS is available and Settings shows the official button
- **When** `mountGoogleSignInButton` runs
- **Then** `renderButton` is called with `size: 'medium'`
- **And** it is not called with `size: 'large'`
- **And** `type` stays `standard` and `text` stays `signin_with`

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (GIS iframe)
- Implementation: `apps/web/src/lib/application/google-signin.ts`
