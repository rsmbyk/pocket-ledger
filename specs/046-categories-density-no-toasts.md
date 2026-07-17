# Spec 046: Categories density and remove toasts

- **ID:** 046
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Tighten Categories card spacing and button sizing, outline save/delete actions, and remove the toast notification system from the app (Categories and More both used it).

## Scope

### In scope

1. **Card padding** — reduce Categories card padding; top and bottom padding match (no uneven vertical padding) — **corrected by [050](050-categories-header-delete/spec.md)** (density targets the **header** only; restore card body feel)
2. **Add size** — header Add icon button matches save/delete control size (`icon-sm` or equivalent)
3. **Save / Delete** — both use **outlined** variants (save no longer fills primary when enabled; delete outlined destructive or outline + destructive text per design tokens) — **delete chrome tightened by [050](050-categories-header-delete/spec.md)** (outlined danger, Void-aligned)
4. **Remove toasts** — remove `svelte-sonner` Toaster from `App.svelte` and all `toast.*` calls in Categories and More
5. **More feedback** — success actions are silent; failures show inline `role="alert"` (no toast)

### Out of scope

- Spec 040 DnD / kind chrome (unchanged except padding/buttons)
- Spec 034 primary-filled save emphasis (superseded: save stays outline)
- Re-adding any global notification system

## Domain rules

- None

## Acceptance scenarios

### Scenario: Even tighter padding

- **Given** Categories cards
- **When** they render
- **Then** padding is reduced vs prior and top/bottom are equal

### Scenario: Matching icon buttons

- **Given** a category row and card Add
- **When** both render
- **Then** Add is not larger than save/delete icon buttons

### Scenario: Outlined save and delete

- **Given** a dirty rename draft
- **When** save is enabled
- **Then** save uses an outline style (not solid primary fill); delete remains outline/destructive outline

### Scenario: No toasts

- **Given** the user renames a category or exports a backup
- **When** the action succeeds
- **Then** no toast notification appears

## Traceability

- Vitest: n/a
- Playwright: optional assert no sonner region; Categories button classes
- Implementation: `CategoriesPanel.svelte`; `MorePanel.svelte`; `App.svelte`; optionally remove `svelte-sonner` dependency
- Depends on: 022, 034, 038, 042 (toast portion)
- Supersedes: Spec 034 primary save fill; Spec 042 toast success banners
