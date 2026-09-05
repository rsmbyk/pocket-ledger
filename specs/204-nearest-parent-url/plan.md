# Plan 204: Invalid URL falls back to nearest valid parent

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Unknown paths show Home while the junk URL stays. Extra segments under a real panel do the same. Walk up to the nearest canonical parent and replace-navigate there.

## Approach

`nearestValidPath` in `router.ts`. `parsePath` / `parsePocketId` use it. Replace-navigate when the address bar is not already that parent. Unknown pocket ids still bounce to `/pockets`.
