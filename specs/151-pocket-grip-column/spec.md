# Spec 151: Pocket grip column

- **ID:** 151
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Pockets list, the drag affordance is a **left column**: the six-dot icon is vertically centered, and pointer-down anywhere in that strip starts reorder. The rest of the card still opens details.

## Scope

### In scope

1. **Centered icon** — On a tall card (name + description + goal), the grip icon sits in the vertical middle of the left column, not on the name line.
2. **Column hit target** — The `dragHandle` control stretches to the full row height (including the card’s vertical padding). Empty space in that column starts the same svelte-dnd-action drag as the icon.
3. **Not whole-row** — Name, description, goal, and amount still activate the Open-details link. Main has no drag; its spacer column matches height for alignment.

### Out of scope

- Category reorder handles
- Relocating delete / clear-goal
- Changing mute-Main-while-dragging (149)
- Whole-row drag (147)

## Domain / UI rules

- Keep `use:dragHandle` (not a zone-wide item drag). The handle is a `span` (not a `<button>`): svelte-dnd-action skips nested controls that expose `.value`, so a button grip would not start a drag.
- `aria-label` stays `Drag to reorder {name}`.
- Supersedes 149 “grip aligned to the name.”

## Acceptance scenarios

### Scenario: Icon is vertically centered

- **Given** a non-Main pocket with description and a goal (tall card)
- **When** the list card renders
- **Then** the grip icon’s vertical center is near the card content’s vertical center (not aligned only with the name)

### Scenario: Drag from the column, not only the icon

- **Given** Main and that tall non-Main pocket
- **When** the user pointer-downs in the left column **below** the six-dot icon and moves
- **Then** consider fires: Main has `data-dnd-locked="true"`
- **And** dropping restores Main

### Scenario: Name still opens details

- **Given** that pocket on the list
- **When** the user activates the name (not the grip column)
- **Then** the URL is `/pockets/{id}`

## Traceability

- Vitest: none
- Playwright: `e2e/pockets.e2e.ts`
- Implementation: `PocketsPanel.svelte` `pocketRow`
- Docs: this folder; `specs/README.md`; 149 grip-alignment line

## Related

- 070 handle reorder; 147 whole-row (categories only); 149 list card states
