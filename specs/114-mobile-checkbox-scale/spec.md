# Spec 114: Mobile checkbox scale

- **ID:** 114
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On viewports below `md`, remaining app checkboxes match the Spec 113 goal-date scale (**`size-5`**) so form gates and filter/reset toggles are easier to tap. From `md` up they stay **`size-4`**.

## Scope

### In scope

1. Pocket form: “Set opening balance” (`data-testid="pocket-opening-enabled"`)
2. Pocket form: “Set goal” (`data-testid="pocket-goal-enabled"`)
3. Activity filters: “Hide voided” (`data-testid="activity-filter-hide-voided"`)
4. Reset dialog: “Keep categories” / “Keep passphrase lock” (`data-testid="reset-preserve-categories"` / `reset-preserve-passphrase`)
5. Class contract: `size-5 accent-primary md:size-4` on each of the above

### Out of scope

- Goal-date trailing “Has date” checkbox (already Spec 113)
- Button / tabs / drawer / month-nav heights (Specs 111 / 112)
- Introducing a shared Checkbox UI primitive
- Desktop (`md+`) size larger than `size-4`
- New dependencies or design tokens

## Domain rules

- None (presentation only)

## Acceptance scenarios

### Scenario: Pocket opening checkbox taller on mobile

- **Given** Add/Edit pocket on a viewport below `md`
- **When** the “Set opening balance” checkbox is shown
- **Then** it uses classes **`size-5 accent-primary md:size-4`**
- **And** `data-testid="pocket-opening-enabled"` is unchanged

### Scenario: Pocket goal checkbox taller on mobile

- **Given** Add/Edit pocket on a viewport below `md`
- **When** the “Set goal” checkbox is shown
- **Then** it uses classes **`size-5 accent-primary md:size-4`**
- **And** `data-testid="pocket-goal-enabled"` is unchanged

### Scenario: Hide voided checkbox taller on mobile

- **Given** the Activity filters sheet on a viewport below `md`
- **When** the “Hide voided” checkbox is shown
- **Then** it uses classes **`size-5 accent-primary md:size-4`**
- **And** `data-testid="activity-filter-hide-voided"` is unchanged

### Scenario: Reset keep checkboxes taller on mobile

- **Given** the Reset everything confirm UI on a viewport below `md`
- **When** “Keep categories” and “Keep passphrase lock” are shown
- **Then** each uses classes **`size-5 accent-primary md:size-4`**
- **And** `data-testid` values `reset-preserve-categories` and `reset-preserve-passphrase` are unchanged

### Scenario: Desktop checkbox density unchanged

- **Given** the viewport width is at or above the Tailwind `md` breakpoint
- **When** any of the in-scope checkboxes is shown
- **Then** each is **`size-4`** (via `md:size-4`)

### Scenario: Goal-date checkbox unchanged

- **Given** Edit pocket with goal enabled
- **When** the “Has date” trailing checkbox is shown
- **Then** it remains Spec 113’s `size-5 accent-primary md:size-4` with the same `aria-label` and `data-testid`

## Traceability

- Vitest: none required (no domain / application rule change)
- Playwright: deferred — class contract + manual narrow-viewport check; no dedicated e2e in this slice
- Implementation:
  - `src/lib/ui/PocketsPanel.svelte`
  - `src/lib/ui/AppShellChrome.svelte`
  - `src/lib/ui/MorePanel.svelte`

## Related

- 111 mobile control heights
- 112 mobile compact button heights
- 113 compound control scale (goal-date checkbox only)
- 086 optional opening + goal checkboxes
- 024 reset all
