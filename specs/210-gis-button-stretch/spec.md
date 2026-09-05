# Spec 210: Stretch the official GIS button

- **ID:** 210
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** is Google’s official GIS widget again (G mark, outline / outline_dark). It fills the Cloud Sync card width and matches Settings button height (`h-9`).

## Scope

Visible GIS host in `MorePanel`. CSS stretch of GIS’s injected wrapper/iframe. Keep 179 popup, 182 theme remount, 205 auto-select, 208 `size: 'medium'`. Remove Spec 209’s shadcn proxy and `clickGoogleSignInButton`. Fake Google shadcn button unchanged (`w-full`). No Playwright GIS iframe asserts.

Supersedes Spec 209 visible chrome only.

## Acceptance scenarios

### Scenario: Official button fills the card

- **Given** production GIS and Settings Cloud Sync while signed out
- **When** the Sign in with Google control is shown
- **Then** it is the GIS widget on `google-sign-in`, not a shadcn button
- **And** the host is full width and `h-9`
- **And** the injected iframe fills that host

### Scenario: Personalization and theme stay

- **Given** GIS mounts
- **When** `renderButton` runs
- **Then** `size` is `medium` (208)
- **And** `theme` is `outline` or `outline_dark` from the resolved scheme (182)

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts` (208/182; no 209 click helper)
- Playwright: none (GIS iframe)
- Implementation: `MorePanel.svelte`, `google-signin.ts`
