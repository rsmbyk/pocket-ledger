# Plan 208: GIS button never personalizes

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Spec 205’s `disableAutoSelect` only blocks One Tap auto-select. Google still personalizes a large standard Sign in with Google button to Sign in as Name for returning users.

## Approach

`renderButton` uses `size: 'medium'`, which Google documents as non-personalized. Keep 205 auto-select guards. Keep official GIS chrome (179), outline themes (182).
