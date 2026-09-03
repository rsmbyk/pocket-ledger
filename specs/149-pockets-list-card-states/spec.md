# Spec 149: Pockets list card states

- **ID:** 149
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Pockets list, each card is a roster row you open for details: grip (or Main spacer) | name, description, goal | amount. Hover/focus shows the card is clickable. Main mutes while you grab another pocket so it reads as immovable. Edit, delete, and clear-goal are not on the card.

## Scope

### In scope

1. **No card actions** — List cards have no `pocket-edit`, `pocket-delete`, or `pocket-clear-goal`. Keep the non-Main six-dot drag handle (070). Keep Add Pocket. Keep details toolbar Edit (`pocket-details-edit`, 148).
2. **No list delete chrome** — Remove the panel `{#if error}` `<p role="alert">` and the **Delete pocket?** confirm (`pocket-delete-confirm`). Domain `deletePocket` stays. Form field errors in the create/edit dialog stay.
3. **Three-column card** — Left: grip or Main spacer, aligned to the name. Middle: name, then description if `notes.trim()`, then goal chrome if enabled. Right: derived amount, top-aligned with the name. `data-testid="pocket-description"` stays. Description is muted `text-xs`, one-line truncate. No `border-t` footer.
4. **Hover / focus highlight** — Pointer hover or `focus-within` (Open-details link) on a list card uses category-chip hover: `bg-accent/70` and a stronger ring (`ring-foreground/20`). No sticky hover after tap. While a drag is in progress, no hover highlight.
5. **Mute Main while grabbing** — During svelte-dnd-action `consider` until `finalize` (pointer or keyboard), the Main card is `opacity-60` and `data-dnd-locked="true"`. Idle Main is full opacity. Do not mute on handle hover or a click that never starts DnD.

### Out of scope

- Relocating delete / clear-goal (no UI in this slice)
- Making Main a drop target or changing `sortOrder`
- Muting Add Pocket or non-Main rows
- Hover on pocket details cards or Categories
- Whole-row drag (grip stays the handle)
- Changing goal copy or progress math (072)
- New domain/Vitest

## Domain / UI rules

- Empty description: no extra line. Empty goal: name (+ description) only in the middle.
- Reorder `runAction` failures have no list banner (that slot was the delete-refusal alert).
- Supersedes 148 “list pencil still opens the existing edit dialog.” Details Edit opens the form. Grip still must not navigate.
- Supersedes 094 “description at the bottom of the card under a divider.” Form Description + `pocket-description-input` stay (108).
- 093 (actions bottom-aligned on tall goal cards) is moot.

## Acceptance scenarios

### Scenario: No list action buttons

- **Given** the Pockets list with Main and a non-Main pocket
- **When** the cards render
- **Then** there is no `pocket-edit`, `pocket-delete`, or `pocket-clear-goal`
- **And** there is no panel `role="alert"` and no `pocket-delete-confirm`
- **And** the non-Main card has a drag handle
- **And** Add Pocket is visible

### Scenario: Details Edit still opens the form

- **Given** the Pockets list
- **When** the user opens a pocket’s details and activates `pocket-details-edit`
- **Then** `pocket-form-dialog` opens

### Scenario: Description sits under the name

- **Given** a pocket with description `Trip fund` and a goal
- **When** the list card renders
- **Then** `pocket-description` is in the same column as the name (not a full-width `border-t` strip)
- **And** vertically it sits between the name and the goal chrome
- **And** the amount is to the right of that column

### Scenario: Hover highlights the card

- **Given** the Pockets list at rest
- **When** the pointer hovers a pocket card
- **Then** that card is highlighted (`bg-accent/70` / stronger ring)
- **And** a sibling card at rest is not

### Scenario: Main mutes while grabbing

- **Given** Main and at least one non-Main pocket
- **When** the user drags a non-Main grip (consider has fired)
- **Then** the Main card has `data-dnd-locked="true"` and computed opacity `0.6`
- **When** they drop or cancel (finalize)
- **Then** Main is no longer locked and opacity is `1`

### Scenario: Grip does not open details

- **Given** the Pockets list
- **When** the user uses the drag handle
- **Then** the URL stays `/pockets` until they drop (no navigation from the grip)

## Traceability

- Vitest: none (list chrome only)
- Playwright: `e2e/pockets.e2e.ts` (149 scenarios); retarget list `pocket-edit` to details Edit in `e2e/pockets.e2e.ts`, `e2e/pocket-details.e2e.ts`, `e2e/goals.e2e.ts`, `e2e/month-opening-from-pockets.e2e.ts`, `e2e/month-summary-bounds.e2e.ts`, `e2e/month-charts.e2e.ts`, `e2e/base-features.e2e.ts`
- Implementation: `PocketsPanel.svelte` `pocketRow`; drop delete confirm + list alert; hover + `dragging` mute
- Docs: this folder; `specs/README.md`; 148 list-pencil; 094 footer; `docs/PRODUCT.md`

## Related

- 070 Main pin + grip reorder; 072 list goal chrome; 094 footer (superseded placement); 108 form Description; 131 muted `opacity-60`; 133/147 hover chips; 148 details + Edit toolbar
