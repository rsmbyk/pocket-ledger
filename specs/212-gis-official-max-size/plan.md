# Plan 212: Official GIS at Google’s max size

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Spec 210 stretched every nested GIS div/iframe to the card width and `h-9`, which distorts the official widget.

## Approach

Delete that CSS. Pass `renderButton` `size: 'large'` and `width` clamped to 400 from the host’s client width. Keep outline / outline_dark, popup, disableAutoSelect, medium is no longer used.
