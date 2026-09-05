# Plan 217: Official GIS at card width

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Ronald locked the playground stretch: the official button fills the Cloud Sync card, G mark stays GIS-sized. Spec 212’s 400 cap and Spec 216’s configurator go away.

## Approach

`renderButton` `width` is the host’s laid-out width (400 only if the host has no layout yet). CSS widens the GIS wrapper and `[role=button]` only. Keep Spec 182 theme, Spec 215 English + `color-scheme: light`, `size: large`, default type/text/shape/logo. Remove `gis-preview`. Fake Google `w-full` unchanged.
