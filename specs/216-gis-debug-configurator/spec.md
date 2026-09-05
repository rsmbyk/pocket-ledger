# Spec 216: Testing-only GIS configurator

- **ID:** 216
- **Status:** Accepted — playground removed; stretch locked in [217](../217-gis-card-width/spec.md)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Temporary signed-out Settings playground so Ronald can remount the official GIS button with Google’s documented looks. **Does not persist. Does not change the shipped default.** Remove this spec’s UI when the look is locked.

## Scope

### In scope

1. Signed-out Cloud Sync when official GIS is shown (`VITE_FAKE_GOOGLE` off, client id set): testing-only native `<select>`s **above** the GIS host.
2. Knobs, remount immediately: `type`, `theme`, `size`, `text`, `shape`, `logo_alignment` (Google `renderButton` enums).
3. Testing-only **Stretch past 400**: when on, the host is full card width and `renderButton` `width` is the host width (not capped at 400). CSS widens only the GIS wrapper and `[role=button]` — not every nested div, so the G mark stays GIS-sized. Shipped default stays Spec 212 cap.
4. Session only: in-memory on Settings. Reload or leaving More restores production defaults. No `localStorage`.
5. Production defaults when a knob is unset: Spec 212 `size: 'large'` + width cap 400, Spec 182 theme, `type: 'standard'`, `text: 'signin_with'`, `shape: 'rectangular'`, `logo_alignment: 'left'`. Spec 215 `locale: 'en'` always.
6. `type: 'icon'`: omit `width` and `logo_alignment`.
7. Testing-only copy: remounts the official button; shipped look comes back on reload.

### Out of scope

- Persisting a look as the production button
- Fake Google shadcn button
- Playwright GIS iframe asserts
- One Tap / `prompt()`
- New Select package / shadcn Select

## Domain rules

- Testing-only copy, same tone as Spec 180.
- Preview overlays production knobs; it does not replace locale or the Chrome host `color-scheme`.
- Enums: `type` `standard` | `icon`; `theme` `outline` | `filled_blue` | `filled_black` | `outline_dark`; `size` `large` | `medium` | `small`; `text` `signin_with` | `signup_with` | `continue_with` | `signin`; `shape` `rectangular` | `pill` | `circle` | `square`; `logo_alignment` `left` | `center`.

## Acceptance scenarios

### Scenario: Playground beside official GIS

- **Given** production-like web (`VITE_GOOGLE_CLIENT_ID` set, fake Google off) and signed out
- **When** Settings → Cloud Sync renders
- **Then** the GIS host is shown
- **And** testing-only GIS knobs are shown above it (`gis-preview`)

### Scenario: Hidden for fake Google

- **Given** `VITE_FAKE_GOOGLE` is on
- **When** Settings → Cloud Sync renders
- **Then** `gis-preview` is not shown

### Scenario: Unset preview is shipped knobs

- **Given** official GIS with no preview overrides
- **When** `gisRenderButtonOptions` runs for dark scheme and host width 280
- **Then** options include `type: 'standard'`, `theme: 'outline_dark'`, `size: 'large'`, `text: 'signin_with'`, `shape: 'rectangular'`, `logo_alignment: 'left'`, `width: 280`, `locale: 'en'`

### Scenario: Preview overrides remount knobs

- **Given** a preview `{ type: 'icon', theme: 'filled_blue', size: 'medium' }`
- **When** `gisRenderButtonOptions` runs
- **Then** `type` is `icon`, `theme` is `filled_blue`, `size` is `medium`
- **And** `width` and `logo_alignment` are omitted

### Scenario: Session only

- **Given** a knob was changed in Settings
- **When** the user reloads or leaves More
- **Then** GIS mounts with production defaults again

### Scenario: Stretch past 400

- **Given** official GIS and the stretch checkbox is on
- **When** `gisRenderButtonOptions` runs with host width 672
- **Then** `width` is 672
- **And** the host is full card width
- **And** CSS does not force nested logo/text divs to 100% height

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts` (`gisRenderButtonOptions`)
- Playwright: none (GIS iframe; e2e stays fake Google)
- Implementation: `google-signin.ts`, `MorePanel.svelte`
