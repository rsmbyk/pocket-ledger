# Spec 113: Compound control scale after mobile heights

- **ID:** 113
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

After Spec 111 raised primary field shells on mobile, nested chrome that shares those shells fills or scales with them: currency prefixes paint edge-to-edge vertically, and the goal-date trailing checkbox reads proportional to the DateField height.

## Scope

### In scope

1. InputGroup inline addons (`inline-start` / `inline-end`) stretch to the full height of the InputGroup shell so backgrounds (e.g. currency muted prefix) have no vertical gap inside the control
2. InputGroup root clips children to its `rounded-md` so stretched addon backgrounds do not square off the corners
3. Pocket goal-date trailing “Has date” checkbox uses `size-5` below `md` and `size-4` from `md` up

### Out of scope

- Decorative icons/chevrons inside DateField, CategoryPicker, QuickAdd, or filter chrome
- Compact button sizes (Spec 112)
- Desktop (`md+`) shell height changes (`h-9` stays)
- Changing Amount horizontal padding (Spec 047 / 105)
- New dependencies or design tokens

## Domain rules

- None (presentation only)

## Acceptance scenarios

### Scenario: Currency prefix fills control height on mobile

- **Given** the viewport width is below the Tailwind `md` breakpoint
- **When** an Amount-similar InputGroup with a muted currency prefix is shown (transaction Amount, transfer Amount/Fee, pocket opening, or pocket goal target)
- **Then** the currency addon background fills the full height of the control (no visible gap above or below the muted strip inside the shell)

### Scenario: Currency prefix fills control height on desktop

- **Given** the viewport width is at or above the Tailwind `md` breakpoint
- **When** the same Amount-similar InputGroup is shown
- **Then** the shell remains **36px** (`h-9`) and the currency addon background still fills that height edge-to-edge vertically

### Scenario: Goal date checkbox scales with the field

- **Given** Edit pocket with goal enabled
- **When** the goal date field renders below `md`
- **Then** the “Has date” checkbox inside the DateField trailing slot is **`size-5`**
- **And** from `md` up it is **`size-4`**
- **And** `aria-label="Has date"` and `data-testid="pocket-goal-date-enabled"` are unchanged

### Scenario: Command search addon still lays out

- **Given** a Command input that uses InputGroup.Addon without a muted fill
- **When** the control renders after the addon stretch change
- **Then** the search addon still lays out correctly (no broken height or clipping regression)

## Traceability

- Vitest: none required (no domain / application rule change)
- Playwright: deferred — class contract + manual narrow-viewport check; no dedicated e2e in this slice
- Implementation:
  - `src/lib/components/ui/input-group/input-group-addon.svelte`
  - `src/lib/components/ui/input-group/input-group.svelte`
  - `src/lib/ui/PocketsPanel.svelte`

## Related

- 111 mobile control heights
- 047 / 105 currency prefix chrome
- 091 goal-date trailing checkbox
