# Spec 097: Pocket row center when no goal

- **ID:** 097
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Pockets panel, when a pocket has **no goal**, the name (and drag handle) are **vertically centered** with the balance and action controls. Cards **with** a goal keep the stretch layout from 093.

## Scope

### In scope

1. `pocketRow` when `!hasGoal`: outer row `items-center` (not stretch)
2. Right column when `!hasGoal`: no stretch / `justify-between` / `mt-auto` — balance and actions share the centered band with the name
3. When `hasGoal`: keep current stretch + bottom actions (093)

### Out of scope

- Goal progress copy or chrome redesign
- Changing button order or testids
- DnD behavior
- `PocketLabel` API changes beyond what the row needs for alignment

## Acceptance scenarios

### Scenario: No goal — name centered

- **Given** a pocket with no goal (no progress block)
- **When** the card renders
- **Then** the pocket name and drag handle are vertically centered with the balance and action buttons in that row

### Scenario: With goal — stretch preserved

- **Given** a pocket with a goal progress block
- **When** the card renders
- **Then** actions remain at the bottom of the end column as in 093 (not mid-card under the balance alone)

## Traceability

- Implementation: `src/lib/ui/PocketsPanel.svelte` (`pocketRow`)
- Hardens: 093

## Related

- 072, 086, 093
