# Spec 226: Sidebar icon rail

- **ID:** 226
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On **large screens**, collapsing the nav leaves an **icon-only rail**. The logo strip **animates** to the inset toolbar height so menu icons begin where the stage begins (under the toolbar). Expanded, the brand is larger with more space around it. **Mobile** stays an overlay drawer.

## Scope

### In scope

1. Desktop/tablet `md+` (same breakpoint as today’s inset sidebar): `collapsible="icon"` (or equivalent). Collapsed width is the existing `--sidebar-width-icon` rail, not `w-0`.
2. **Expanded brand** — larger than today’s 36px (`size-9`) + `text-sm` in `p-4` `gap-2`: about **48px** logo (`size-12`), **text-base** “Pocket Ledger”, more header padding and gap (about `p-6` / `gap-3`). Still stacked, centered.
3. **Collapsed brand** — wordmark hidden. Header height matches the inset toolbar (`min-h-14`). Logo scales/animates into that strip. Nav (`app-nav`) starts **below** the strip, level with content under the toolbar.
4. **Collapsed footer** — signed-in `sidebar-account` shows the avatar only (no name/email).
5. **Nav** — labels hidden when collapsed; **tooltips** show the item name. Active/hover accent unchanged (013).
6. **Trigger** — existing `Sidebar.Trigger` / 019 morph toggles collapse on `md+` and overlay on small viewports.
7. **Default expanded.** Persist collapsed/expanded with the current sidebar cookie/key.
8. Animation: width + brand size/opacity, same duration class as today’s sidebar transition.

### Out of scope

- New favicon / wordmark art
- Moving the trigger into the rail
- Changing nav destinations (223 adds Plans on its own)
- Default collapsed

## Domain / UI rules

- Supersedes 013 “`collapsible="offcanvas"` (not icon rail)” for `md+` only.
- Small viewports: overlay sheet as today (013 / 019).
- Cookie/persist behavior stays the sidebar provider’s existing storage.

## Acceptance scenarios

### Scenario: Expanded brand is larger

- **Given** the desktop sidebar is expanded
- **When** the header renders
- **Then** the logo is larger than 36px (about 48px)
- **And** the wordmark “Pocket Ledger” is visible at text-base
- **And** padding/gap around the brand is larger than `p-4` / `gap-2`

### Scenario: Collapsed rail stays on screen

- **Given** desktop (`md+`) with the sidebar expanded
- **When** the user activates the sidebar trigger
- **Then** a narrow icon rail remains (not offcanvas `w-0`)
- **And** nav icon buttons are visible without labels
- **And** tooltips name the items

### Scenario: Collapsed logo matches toolbar

- **Given** the sidebar is collapsed on desktop
- **When** the rail header and the inset toolbar render
- **Then** the brand strip height matches the toolbar (`min-h-14`)
- **And** the first nav item sits below that strip
- **And** the wordmark is not shown

### Scenario: Collapsed account is avatar-only

- **Given** a signed-in user and a collapsed desktop sidebar
- **When** `sidebar-account` renders
- **Then** the avatar is shown
- **And** the display name and email are not visible

### Scenario: Mobile overlay unchanged

- **Given** a viewport below `md`
- **When** the user opens the menu
- **Then** the nav is still an overlay drawer (not a persistent icon rail)

### Scenario: Persist

- **Given** desktop sidebar collapsed
- **When** the user reloads
- **Then** the sidebar is still collapsed

## Traceability

- Vitest: none required (chrome); optional `apps/web/src/lib/shared/router.test.ts` untouched
- Playwright: `e2e/desktop-layout.e2e.ts` — expand/collapse rail; collapsed header vs toolbar height; wordmark hidden; mobile overlay
- Implementation: `AppShellChrome.svelte` Sidebar.Root `collapsible`; brand header classes/transition; `sidebar-account` collapsed; MenuButton tooltips

## Related

- 013, 019, 160, 186, 223 (nav items)
