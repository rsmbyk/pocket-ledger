# Spec 129: Categories toolbar full width on small screens

- **ID:** 129
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On small viewports, Add group and Reorder are equal-width and fill the Categories catalog row so the toolbar matches search and tabs.

## Scope

### In scope

1. **Below `md` (width &lt; 768px)** — In default (non-reorder) mode, `category-add-group` and `category-reorder` sit on one row, each **half** the catalog width (equal), spanning the same horizontal inset as search / kind tabs (126).
2. **`md` and up** — Those two buttons stay hug-content and right-aligned (`justify-end`), as today.

### Out of scope

- Reorder-mode Reset / Discard / Save (leave hug-content)
- Catalog grid (128); picker search (130); group header (131)
- Changing button labels or icons
- Android

## Domain / UI rules

- Breakpoint is viewport **`md`**, same as Spec 126 (not hover/pointer media).
- Gap between the two buttons may stay (existing `gap-2`); the **occupied row** is still full catalog width.
- Reorder mode does not use this two-column stretch.

## Acceptance scenarios

### Scenario: Phone toolbar fills the row

- **Given** Categories, not reorder, viewport width **390px**
- **When** Add group and Reorder are measured
- **Then** their widths are equal (within 2px)
- **And** the pair spans the catalog content width (same inset as `category-search`)

### Scenario: Desktop toolbar stays compact

- **Given** Categories, not reorder, viewport width **1024px**
- **When** Add group and Reorder are shown
- **Then** they are not stretched to half the catalog
- **And** they remain on the trailing (right) side of the toolbar row

### Scenario: Reorder actions unchanged

- **Given** reorder mode, viewport **390px**
- **When** Reset, Discard, and Save are shown
- **Then** they are not forced into a two-column equal-width row

## Traceability

- Vitest: none
- Playwright: `e2e/categories.e2e.ts` (390px: equal widths + row span; 1024px: not half-width)
- Implementation: `apps/web/src/lib/ui/CategoriesPanel.svelte` toolbar row
- Docs: this folder; `specs/README.md` index
- Depends on: 124, 126

## Related

- 124 Add group / Reorder icons; 126 `md` chrome
