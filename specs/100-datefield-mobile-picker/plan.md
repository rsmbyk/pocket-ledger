# Plan 100: DateField opens on mobile

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Hardens:** 042, 044, 047

## Why

Tapping Date on Add/Edit transaction (and other DateField surfaces) does nothing on mobile. Reported on mobile; root cause likely affects any browser without a working `showPicker()` path for hidden date inputs — notably **iOS Safari**, where `showPicker()` for `type="date"` is unsupported.

## Diagnosis

`DateField` paints a styled trigger button and keeps a native `<input type="date">` in `sr-only`. Open path:

1. Prefer `nativeInput.showPicker()`
2. On throw → `focus()` + `click()` on the hidden input

On iOS, `showPicker()` for date is a **silent no-op** (does not throw), so the fallback never runs. Even the fallback often fails on visually clipped / off-screen inputs. Result: tap → nothing.

## Approach (preferred)

Keep the formatted readout + calendar icon chrome. Make the native date input the **actual hit target**: stretch it over the field (opacity 0, not `sr-only` clip), so a tap/click is a real user activation on `<input type="date">`. Trailing snippet (goal-date checkbox) stays above the input and clickable.

- No new date-picker dependency
- Same ISO `YYYY-MM-DD` storage and `YY Mon DD` display
- Fixes tx sheet, Activity From/To, Pockets dates in one shared control

### Tradeoff vs Spec 047 toggle

047’s “second click closes picker” relied on button + `showPicker` + tracked `pickerOpen`. Native overlay open/close is OS-controlled; **relax or drop desktop toggle-close** rather than reintroduce a broken mobile path. Call out in spec.

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| **A. Opacity-0 native overlay (preferred)** | Minimal; works with OS pickers; no deps | Softens 047 toggle |
| B. bits-ui / shadcn Calendar popover | Consistent in-app UI; 047 toggle easy | New surface; out-of-scoped in 047; more code |
| C. Desktop `showPicker` + mobile overlay only | Preserves 047 on desktop | Dual paths; UA sniffing / coarse-pointer heuristics |

## Out of this slice

- Replacing native picker with a custom calendar (unless Ronald picks B)
- Changing date display/storage formats
