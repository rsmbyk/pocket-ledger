# Spec 111: Mobile control heights

- **ID:** 111
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On viewports below `md`, primary interactive controls are tall enough for comfortable touch (**44px / `h-11`**). On `md` and up, density stays **36px / `h-9`**.

## Scope

### In scope

1. Button size `default` and `icon` use `h-11` / `size-11` below `md`, and `h-9` / `size-9` from `md` up
2. Button size `lg` / `icon-lg` stay at least as tall as `default` / `icon` on each breakpoint (bump on mobile if needed so hierarchy holds)
3. Input and InputGroup root match those primary heights (`h-11 md:h-9`)
4. Horizontal Tabs list matches (`h-11 md:h-9`); triggers continue to fill the list height
5. App chrome that hardcodes `h-9` for primary fields/triggers matches: CategoryPicker trigger, DateField chrome, QuickAdd pocket/type triggers, AppShell filter chrome

### Out of scope

- Compact button sizes (`xs`, `sm`, `icon-xs`, `icon-sm`)
- Dropdown menu item padding, textarea `min-h`, sidebar menu button heights, sticky header `h-14`
- Desktop (`md+`) height changes
- New dependencies or CSS height tokens

## Domain rules

- None (presentation only)

## Acceptance scenarios

### Scenario: Primary controls taller on mobile

- **Given** the viewport width is below the Tailwind `md` breakpoint
- **When** a default Button, an Input, or a CategoryPicker trigger is shown
- **Then** each has a computed height of **44px** (`h-11`)

### Scenario: Desktop density unchanged

- **Given** the viewport width is at or above the Tailwind `md` breakpoint
- **When** the same default Button, Input, or CategoryPicker trigger is shown
- **Then** each has a computed height of **36px** (`h-9`)

### Scenario: Compact sizes stay dense

- **Given** any viewport
- **When** a Button with size `sm` or `icon-sm` is shown
- **Then** its height remains the pre-111 compact size (`h-8` / `size-8`), not bumped to `h-11`

### Scenario: Tabs track list height

- **Given** a horizontal Tabs list on a mobile viewport
- **When** the list is shown
- **Then** the list height is **44px** and active/inactive triggers fill that height

## Traceability

- Vitest: none required (no domain / application rule change)
- Playwright: deferred — class contract + manual narrow-viewport check; no dedicated height e2e in this slice
- Implementation:
  - `src/lib/components/ui/button/button.svelte`
  - `src/lib/components/ui/input/input.svelte`
  - `src/lib/components/ui/input-group/input-group.svelte`
  - `src/lib/components/ui/tabs/tabs-list.svelte`
  - `src/lib/ui/CategoryPicker.svelte`
  - `src/lib/ui/DateField.svelte`
  - QuickAdd pocket/type triggers (e.g. `src/lib/ui/QuickAddSheet.svelte`)
  - AppShell filter chrome (e.g. `src/lib/ui/AppShellChrome.svelte`)

## Related

- 039 transaction sheet polish (type controls → `h-9`; this slice only adds mobile-taller via shared primitives / matching chrome)
- 013 desktop layout (sidebar `lg` / 48px unchanged)
