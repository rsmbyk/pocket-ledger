# Plan 182: GIS button theme

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 179

## Why

The official GIS button is an iframe. Spec 179 hardcodes `theme: outline` (white fill), which does not follow Pocket Ledger dark mode. We cannot paint the iframe with CSS tokens.

## Approach

Pass Google’s documented `outline` (light) vs `outline_dark` (dark) into `renderButton`. Remount when `mode-watcher` resolved mode changes. Fake Google shadcn button already follows theme.

## Scope / edges

**In:** `gisButtonTheme` helper, `mountGoogleSignInButton` `colorScheme`, MorePanel remount on theme cycle.

**Out:** Custom Google button, One Tap, matching exact `--card` tokens, Cursor IDE GIS popup, fake-Google e2e iframe asserts.
