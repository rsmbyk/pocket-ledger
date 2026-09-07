# Spec 228: Collapsed rail icon-only

- **ID:** 228
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The collapsed icon rail shows **icons only**, centered. No clipped nav letters. Signed-in avatar is centered. Tooltips and accessible names stay.

## Scope

### In scope

1. Collapsed `app-nav` buttons: no visible label text. Expanded still shows full labels.
2. Collapsed nav icons horizontally centered in the rail.
3. Collapsed `sidebar-account`: avatar / Google picture centered; name/email stay hidden (226).
4. Accessible name remains (sr-only or `aria-label`) so `nav-home` is still “Home”.
5. Tooltips still name items when collapsed and not mobile (226).

### Out of scope

- Overlay drawer (phone): icon + full label, left-aligned as today
- Breakpoint (227)
- Brand wordmark (already hidden when collapsed)

## Domain / UI rules

- Finishes 226 “labels hidden when collapsed”.
- Do not rely on overflow clipping as the hide.

## Acceptance scenarios

### Scenario: No clipped letters

- **Given** a collapsed desktop sidebar
- **When** `app-nav` renders
- **Then** buttons have no visible “Home” / “Pockets” / “Plans” / … text
- **And** each control still has accessible name matching the destination

### Scenario: Icons centered

- **Given** a collapsed desktop sidebar
- **When** a nav icon renders
- **Then** it is horizontally centered in the rail (not left-aligned beside leftover text)

### Scenario: Avatar centered

- **Given** a signed-in user and collapsed desktop sidebar
- **When** `sidebar-account` renders
- **Then** the avatar is horizontally centered
- **And** name and email are not visible

### Scenario: Phone drawer unchanged

- **Given** the overlay drawer on a narrow viewport
- **When** nav items render
- **Then** each item shows icon and full label

## Traceability

- Vitest: none required
- Playwright: `e2e/desktop-layout.e2e.ts` — collapsed rail labels hidden; optional bbox near midline
- Implementation: `sidebar-menu-button.svelte` collapsed `sr-only`/`hidden` + `justify-center`; `AppShellChrome.svelte` account `justify-center`

## Related

- 226, 227
