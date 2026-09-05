# Plan 216: Testing-only GIS configurator

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Ronald needs to compare official GIS looks live in Settings without changing the shipped Sign in button.

## Approach

Signed-out Cloud Sync, official GIS only: testing-only native `<select>`s for Google’s `renderButton` knobs, plus a CSS stretch checkbox (Spec 210 fill). Changing a control remounts the iframe. In-memory on Settings — reload or leaving More restores Spec 182/212 defaults. Merge preview onto `gisRenderButtonOptions`. Hidden when `VITE_FAKE_GOOGLE` is on.
