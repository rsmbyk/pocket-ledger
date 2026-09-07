# Spec 227: Sidebar rail at sm

- **ID:** 227
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The inset sidebar and icon rail start at **`sm` (640px)**. Viewports below 640px keep the overlay drawer. Other product `md` (768px) cuts stay.

## Scope

### In scope

1. Sidebar `IsMobile` breakpoint **640** (`max-width: 639px` is overlay).
2. Tailwind `md:` → `sm:` on the persistent rail / inset primitives so CSS matches JS.
3. Playwright: ~751px is a persistent rail (no `sheet-overlay`); 390px is still overlay.
4. PRODUCT note: sidebar cut is `sm`.

### Out of scope

- Transaction/plan dialog vs sheet (`min-width: 768px`)
- Categories `belowMd` / `IsMobile()` default 768
- Filters sheet side / xl drawer at 1280
- Collapsed icon-only polish (228)
- Default collapsed

## Domain / UI rules

- Supersedes 226 “`md+` rail, below-md overlay” for the **sidebar shell only**.
- Default expanded; cookie unchanged.
- Categories and other `IsMobile()` callers keep the 768 default.

## Acceptance scenarios

### Scenario: 751px uses the rail

- **Given** viewport width 751px
- **When** the user activates the sidebar trigger
- **Then** no `sheet-overlay` / `app-drawer-sheet`
- **And** `app-drawer-rail` remains
- **And** collapse hides the wordmark (226)

### Scenario: Phone overlay unchanged

- **Given** viewport 390×844
- **When** the user opens the menu
- **Then** the nav is an overlay drawer, not a persistent icon rail

### Scenario: 1280px unchanged

- **Given** viewport 1280px
- **When** the sidebar is collapsed
- **Then** the icon rail behaves as 226

## Traceability

- Vitest: none required
- Playwright: `e2e/desktop-layout.e2e.ts` — 751 rail; 390 overlay; 1280 collapse stays
- Implementation: `context.svelte.ts` `new IsMobile(640)`; `sidebar.svelte` / `sidebar-inset.svelte` `sm:`; `docs/PRODUCT.md`

## Related

- 013, 226
