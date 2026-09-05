# Spec 212: Official GIS at Google’s max size

- **ID:** 212
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** is Google’s official GIS widget at the largest size GIS allows (`width` 400, `size` large). Do not CSS-stretch the iframe.

## Scope

Visible GIS host in `MorePanel`. `renderButton` `width` + `size: 'large'`. Keep 179 popup, 182 theme, 205 auto-select. Fake Google shadcn `w-full` unchanged. No Playwright GIS iframe asserts.

Supersedes Spec 210 CSS stretch and Spec 208 `size: 'medium'`. **Sign in as Name may return** with `large`.

## Acceptance scenarios

### Scenario: Official knobs, no CSS stretch

- **Given** production GIS and Settings Cloud Sync while signed out
- **When** `renderButton` runs
- **Then** `size` is `large`
- **And** `width` is the host width in pixels, capped at 400 (400 if the host has no layout yet)
- **And** nested GIS divs/iframes are not forced to 100% width/height via CSS

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (GIS iframe)
- Implementation: `google-signin.ts`, `MorePanel.svelte`
