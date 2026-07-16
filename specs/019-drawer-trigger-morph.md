# Spec 019: Drawer trigger morphing icon

- **ID:** 019
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Give clearer open/close feedback on the toolbar drawer control by morphing the existing panel/drawer icon with the drawer state.

## Scope

### In scope

- Keep the **current panel/drawer icon family** (`PanelLeft` style) — not hamburger, not X
- Same trigger button morphs between **closed** and **open** panel-icon variants (e.g. `PanelLeft` ↔ `PanelLeftClose`) with a short transition (~200–300ms) aligned to the drawer animation
- Desktop offcanvas and mobile sheet both drive the morph from sidebar open state
- `aria-label` reflects state (“Open menu” / “Close menu”)
- No new animation library

### Out of scope

- Changing drawer slide/scrim animation behavior itself
- Nav item icons
- Replacing the glyph with hamburger/X

## Domain rules

- None (chrome-only)

## Acceptance scenarios

### Scenario: Icon reflects closed vs open

- **Given** the drawer is closed
- **When** the user views the toolbar trigger
- **Then** the closed panel-icon variant is shown
- **When** the user opens the drawer
- **Then** the icon morphs to the open/close panel variant

### Scenario: Label updates

- **Given** mobile viewport
- **When** the drawer opens and closes
- **Then** the trigger `aria-label` switches between open and close wording

### Scenario: Still toggles drawer

- **Given** either viewport
- **When** the user activates the trigger
- **Then** the drawer opens or closes as today

## Traceability

- Playwright: light check in `e2e/desktop-layout.e2e.ts` (toggle + aria if asserted)
- Implementation: `src/lib/components/ui/sidebar/sidebar-trigger.svelte`
- Related: `specs/013-desktop-layout.md` chrome
