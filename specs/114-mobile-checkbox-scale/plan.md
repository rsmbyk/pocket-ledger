# Plan 114: Mobile checkbox scale

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 111 (mobile primary heights); Spec 112 (compact buttons); Spec 113 (goal-date checkbox only)

## Why

Specs 111–113 raised primary shells, compact icon buttons, and the goal-date trailing checkbox on mobile. Other app checkboxes stayed dense (`size-4` or browser default), so form gates and filter/reset toggles still feel small on phones next to taller neighbors.

## Approach

Reuse the Spec 113 class contract on every remaining native checkbox call site:

- Below `md`: `size-5` (20px)
- From `md` up: `size-4` (16px)
- Keep `accent-primary` where already used; add it on call sites that lack it so accent matches pocket form checkboxes

No new Checkbox primitive — native `<input type="checkbox">` only.

## Scope / edges

**In:**

- Pocket “Set opening balance” / “Set goal”
- Activity “Hide voided”
- Reset “Keep categories” / “Keep passphrase lock”

**Out:**

- Goal-date “Has date” (already Spec 113)
- Toolbar / tabs / drawer / month arrows (Specs 111 / 112)
- Desktop density change beyond restoring `size-4` at `md+`
- New deps or design tokens
