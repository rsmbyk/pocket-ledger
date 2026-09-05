# Spec 209: GIS Sign in matches other Settings buttons

- **ID:** 209
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** uses the same full-width `h-9` shadcn button as fake Google and Sign out. Clicking it still opens the GIS popup.

## Scope

Visible button chrome in `MorePanel`. Hidden GIS `renderButton` + click helper in `google-signin.ts`. Keep 179 popup, 182 theme remount, 205 auto-select, 208 `size: 'medium'`. Fake Google path unchanged. No One Tap `prompt()`. No Playwright GIS iframe asserts.

`data-testid="google-sign-in"` moves to the visible shadcn button (supersedes Spec 179 item 5 host wrapper).

## Acceptance scenarios

### Scenario: Visible button matches Settings actions

- **Given** production GIS (client id set, fake Google off) and Settings Cloud Sync while signed out
- **When** the Sign in with Google control is shown
- **Then** it is the shadcn button (`google-sign-in`), full width, `h-9`
- **And** it is disabled until GIS has mounted
- **When** GIS fails to load
- **Then** the Cloud Sync error alert shows (179)

### Scenario: Click opens GIS popup

- **Given** GIS has mounted on the hidden host
- **When** the user activates `google-sign-in`
- **Then** the helper clicks GIS’s inner `div[role=button]`
- **And** `prompt()` is not called

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: existing fake-Google `google-sign-in` clicks (179)
- Implementation: `google-signin.ts`, `MorePanel.svelte`
