# Plan 210: Stretch the official GIS button

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

209 hid the GIS widget behind a shadcn button, so the G mark and outline / outline_dark theme disappeared. Ronald wants the original Google button, stretched to the Cloud Sync card.

## Approach

Show GIS on the visible `google-sign-in` host (`w-full h-9`). CSS forces the injected iframe to 100% width and height. Keep `size: 'medium'` (208). Remove the 209 click proxy.
