# Plan 215: Official GIS English + Chrome iframe halo

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

GIS follows the browser or Google-account language unless we set `locale` and load `gsi/client?hl=…`. Incognito makes that obvious. Chrome in dark mode also paints a white canvas around the GIS iframe because the page `color-scheme` leaks in.

## Approach

Always load `gsi/client?hl=en` and pass `renderButton` `locale: 'en'`. Do not reuse a script tag without `hl=en`. Set `color-scheme: light` on the GIS host. Keep Spec 182 outline / outline_dark and Spec 212 size/width. No CSS stretch of nested iframes.
