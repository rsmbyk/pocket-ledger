# Spec 215: Official GIS English + Chrome iframe halo

- **ID:** 215
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Production **Sign in with Google** is always English, including incognito. Chrome dark mode must not paint a white box around the GIS iframe.

## Scope

1. Load `https://accounts.google.com/gsi/client?hl=en`. Do not reuse a `gsi/client` script that lacks `hl=en`.
2. `renderButton` always includes `locale: 'en'`.
3. GIS host `.gis-sign-in` uses `color-scheme: light` so Chrome does not draw a white iframe canvas in dark mode.
4. Keep Spec 182 theme mapping and Spec 212 `size: 'large'` + width cap 400.

Applies to every official `renderButton` call (shipped default and Spec 216 preview).

## Out of scope

- Playground knobs (216)
- One Tap `color_scheme` / `prompt()`
- Painting the iframe with Pocket Ledger tokens
- Switching production dark theme to `filled_black`
- Playwright GIS iframe asserts
- Spec 212 CSS stretch of nested GIS divs/iframes

## Acceptance scenarios

### Scenario: English locale

- **Given** official GIS is mounted
- **When** `renderButton` runs
- **Then** it is called with `locale: 'en'`
- **And** the GIS script src is `https://accounts.google.com/gsi/client?hl=en`

### Scenario: Stale script without hl is not reused

- **Given** a `gsi/client` script is already in the document without `hl=en`
- **When** GIS is mounted
- **Then** the app loads `gsi/client?hl=en` instead of reusing the stale tag

### Scenario: Dark scheme still outline_dark

- **Given** resolved theme is dark and official GIS is mounted
- **When** `renderButton` runs
- **Then** `theme` is `outline_dark`
- **And** the GIS host uses `color-scheme: light`

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (GIS iframe)
- Implementation: `google-signin.ts`, `MorePanel.svelte`
