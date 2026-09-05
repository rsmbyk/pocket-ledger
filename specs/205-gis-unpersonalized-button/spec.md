# Spec 205: Default GIS button, not Sign in as Name

- **ID:** 205
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The official Google button stays the default **Sign in with Google** control. It must not switch to **Sign in as XXX** after a prior sign-in and sign-out on this origin.

## Scope

GIS `initialize` / `renderButton` in `google-signin.ts`, and `disableAutoSelect` after Sign out in `App.svelte`. Fake Google shadcn button unchanged. No One Tap `prompt()`. No Playwright GIS iframe asserts (179).

## Acceptance scenarios

### Scenario: Mount disables auto-select

- **Given** GIS is available and Settings shows the official button
- **When** `mountGoogleSignInButton` runs
- **Then** `initialize` is called with `auto_select: false`
- **And** `disableAutoSelect` runs before `renderButton`
- **And** `prompt` is not called

### Scenario: Sign out disables auto-select

- **Given** GIS was loaded
- **When** the user signs out
- **Then** `disableAutoSelect` is called before the signed-out reload

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (GIS iframe)
- Implementation: `google-signin.ts`, `App.svelte`
