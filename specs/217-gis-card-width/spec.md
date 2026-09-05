# Spec 217: Official GIS at card width

- **ID:** 217
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** fills the Cloud Sync card. Other GIS knobs stay the shipped defaults. The Spec 216 playground is gone.

## Scope

1. Official GIS host is `w-full`. `renderButton` `width` is the host width in pixels (400 if the host has no layout yet). No 400 cap when the host is wider.
2. CSS widens only the GIS wrapper and `[role=button]`. Do not force nested logo/text divs to 100% height.
3. Defaults: Spec 182 `outline` / `outline_dark`, Spec 215 `locale: 'en'` + host `color-scheme: light`, `size: 'large'`, `type: 'standard'`, `text: 'signin_with'`, `shape: 'rectangular'`, `logo_alignment: 'left'`.
4. Remove Spec 216 `gis-preview` selects and stretch checkbox.

Supersedes Spec 212’s 400 cap. Removes Spec 216’s UI. Keep 179 popup, 205 auto-select. Fake Google shadcn `w-full` unchanged. No Playwright GIS iframe asserts.

## Acceptance scenarios

### Scenario: Card width, default knobs

- **Given** official GIS and Settings Cloud Sync while signed out
- **When** `renderButton` runs with host width 672
- **Then** `width` is 672
- **And** `size` is `large`, `theme` follows Spec 182, `text` is `signin_with`, `locale` is `en`
- **And** `gis-preview` is not shown

### Scenario: Narrow host still fits

- **Given** official GIS and a host 280px wide
- **When** `renderButton` runs
- **Then** `width` is 280

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (GIS iframe)
- Implementation: `google-signin.ts`, `MorePanel.svelte`, `app.css`
