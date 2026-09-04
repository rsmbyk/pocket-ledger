# Spec 182: GIS button theme

- **ID:** 182
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The production **Sign in with Google** GIS widget must follow the resolved light/dark color scheme. Dark mode must not keep Google’s white outline button.

## Scope

### In scope

1. `google.accounts.id.renderButton` uses `theme: 'outline'` when the resolved scheme is light, and `theme: 'outline_dark'` when dark.
2. Cycling theme while signed-out Settings shows the GIS widget remounts the button so the iframe matches.
3. Fake Google (`VITE_FAKE_GOOGLE`) keeps the shadcn button (already themed). Popup `initialize` from spec 179 is unchanged.

### Out of scope

- Painting the GIS iframe with Pocket Ledger CSS variables
- One Tap / `prompt()` / `ux_mode: 'redirect'`
- Making GIS popup work in Cursor’s IDE browser
- Playwright GIS iframe assertions (e2e stays fake Google)

## Domain rules

- GIS documents `outline` and `outline_dark` as the light/dark outline pair. Do not switch to `filled_blue` for this spec.
- `color_scheme` on GIS initialize is One Tap, not this button.

## Acceptance scenarios

### Scenario: Light scheme uses outline

- **Given** resolved theme is light and real GIS is mounted
- **When** `renderButton` runs
- **Then** it is called with `theme: 'outline'`

### Scenario: Dark scheme uses outline_dark

- **Given** resolved theme is dark and real GIS is mounted
- **When** `renderButton` runs
- **Then** it is called with `theme: 'outline_dark'`

### Scenario: Theme cycle remounts GIS

- **Given** signed-out Settings showing the GIS widget
- **When** the user cycles to the other resolved scheme
- **Then** GIS is remounted with the matching `theme`

## Traceability

- Vitest: `apps/web/src/lib/application/google-signin.test.ts`
- Playwright: none (fake Google)
- Implementation: `google-signin.ts`, `MorePanel.svelte`

## Related

- 179 GIS popup sign-in
