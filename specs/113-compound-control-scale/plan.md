# Plan 113: Compound control scale after mobile heights

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 111 (mobile primary heights); Spec 047 / 105 (currency prefix chrome); Spec 091 (goal-date trailing checkbox)

## Why

Spec 111 raised primary shells to **`h-11` (44px)** below `md`, but nested pieces kept content-sized chrome:

- Currency InputGroup addons still use `h-auto py-1.5`, so `bg-muted/60` sits short inside the taller group (visible gap above/below).
- Goal-date trailing checkbox stays `size-3.5` (14px) inside a taller DateField.

Decorative `size-4` icons/chevrons in taller triggers are normal affordances and stay out of this slice.

## Approach

- **InputGroup inline addon:** `self-stretch` (drop `h-auto` + `py-1.5` on inline aligns) so muted prefix backgrounds fill the shell height; keep horizontal padding and `items-center` for label text.
- **InputGroup root:** `overflow-hidden` so full-height addon backgrounds clip to `rounded-md`.
- **Goal-date checkbox:** `size-5 md:size-4` so mobile reads proportional to `h-11`; desktop matches nearby form checkboxes.
- Prefer primitive fixes; leave Amount call-site classes (`bg-muted/60 … px-2.5`) unchanged.

## Scope / edges

**In:**

- InputGroup addon stretch for `inline-start` / `inline-end`
- InputGroup root overflow clip
- Pocket goal-date trailing checkbox size

**Out:**

- Decorative icons/chevrons in DateField / CategoryPicker / filter chrome
- Compact buttons (Spec 112), desktop shell heights, new tokens/deps
- Amount horizontal padding contract (Spec 047 / 105)
