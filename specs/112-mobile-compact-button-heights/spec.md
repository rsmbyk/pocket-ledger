# Spec 112: Mobile compact button heights

- **ID:** 112
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On viewports below `md`, compact Button sizes (`sm` / `icon-sm`) are easier to tap (**40px**) while staying slightly shorter than Spec 111 primary controls (**44px**). Desktop density for those sizes is unchanged.

## Scope

### In scope

1. Button size `sm`: `h-10 md:h-8`
2. Button size `icon-sm`: `size-10 md:size-8`
3. Call sites that already use those sizes inherit the bump (header, filters, month nav, category/pocket icon actions, theme menu, sheet/dialog close, etc.)

### Out of scope

- `xs` / `icon-xs`
- Spec 111 primary sizes (`default` / `icon` / `lg` / inputs / tabs / field chrome)
- Desktop (`md+`) height changes for `sm` / `icon-sm`
- New dependencies or height tokens

## Domain rules

- None (presentation only)

## Acceptance scenarios

### Scenario: Compact text button taller on mobile

- **Given** the viewport width is below the Tailwind `md` breakpoint
- **When** a Button with `size="sm"` is shown
- **Then** its computed height is **40px** (`h-10`)

### Scenario: Compact icon button taller on mobile

- **Given** the viewport width is below the Tailwind `md` breakpoint
- **When** a Button with `size="icon-sm"` is shown
- **Then** its computed size is **40×40px** (`size-10`)

### Scenario: Desktop compact density unchanged

- **Given** the viewport width is at or above the Tailwind `md` breakpoint
- **When** a Button with `size="sm"` or `size="icon-sm"` is shown
- **Then** heights stay **32px** (`h-8` / `size-8`)

### Scenario: Still shorter than primary on mobile

- **Given** a mobile viewport
- **When** a `sm` Button and a `default` Button are shown
- **Then** `sm` is **40px** and `default` remains **44px** (`h-11` from Spec 111)

## Traceability

- Vitest: none required
- Playwright: deferred — class contract + manual narrow-viewport check
- Implementation: `src/lib/components/ui/button/button.svelte` only
- Follows: Spec 111

## Related

- 111 mobile control heights (primary; compact was out of scope there)
