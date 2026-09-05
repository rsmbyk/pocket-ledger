# Plan 209: GIS Sign in matches other Settings buttons

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

The official GIS iframe is a short, shrink-wrapped control. Settings actions are full card width and `h-9`. Fake Google already uses that chrome.

## Approach

Visible shadcn **Sign in with Google** (`w-full`, `h-9`). Hidden GIS host still `renderButton` (medium, 208). Visible click hits GIS `div[role=button]`.
