# Spec 133: Visual system (Mist / Ink / Figtree)

- **ID:** 133
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The signed-out and signed-in web app uses the locked Mist / Ink / Figtree look in every environment, not only the former preview overlay.

## Scope

### In scope

1. **Surfaces (Mist)** — light background `#eef1f4`, card `#f6f8fa`, sidebar `#e6eaee`, foreground `#161a1e`; dark background `#12151a`, card `#1a1e24`, sidebar `#161a20`, foreground `#e8ecf0`. Matching muted / border / input / accent tokens.
2. **Accent (Ink)** — primary `#161a1e` / on-primary `#eef1f4`; dark inverted.
3. **Type** — Figtree (self-hosted variable font). Library spacing (no Snug).
4. **Radius** — `7px` (`0.4375rem`) as `--radius`.
5. **Elevation** — Current+ on cards and the Home balance hero; Lift on sheets and dialogs.
6. **Money (Brick)** — income `#059669` (dark `#34d399`); expenses and destructive `#c43315` (dark `#f37850`). Do not paint kind tabs as a solid Brick fill (labels stay readable).
7. **Charts (Soft)** — bars mix Brick with muted at rest; hovered bar is full Brick; sibling bars do not dim; no hover ring.
8. **Focus (Quiet)** — `:focus-visible` is a 2px muted-foreground mix ring, not the loud zinc ring.
9. **Scrollbars (B)** — native bars take no layout space; a thin overlay thumb appears while scrolling and fades when idle. Site-wide.
10. **Buttons** — every `Button` size that used a taller mobile value now uses the former `md+` height at all viewports: labeled `default` / `sm` / `lg` are **36px** (`h-9`); `icon` **36px**; `icon-sm` **32px**; `icon-lg` **40px**. `xs` / `icon-xs` unchanged. Inputs, tabs, and pickers stay Spec 111 (`h-11 md:h-9`).
11. **PWA** — `theme-color` / manifest follow Mist (`#eef1f4` light, `#12151a` when dark).
12. **Remove** the dev-only `PalettePreviewBar`.

### Out of scope

- `lib/ui/kit` wrapper around shadcn
- Snug density
- Empty-state copy/layout rewrite
- Android

## Domain / UI rules

None (presentation). Spec 111/112 mobile-taller `Button` sizes are superseded; field chrome (inputs, tabs, pickers) still follows 111.

## Acceptance scenarios

### Scenario: Mist surfaces in production CSS

- **Given** a signed-out session on Home in light mode
- **When** the page paints
- **Then** `body` background is `#eef1f4`
- **And** the computed `font-family` includes Figtree
- **And** `--radius` is `0.4375rem`

### Scenario: Overlay scrollbar does not reserve a gutter

- **Given** Categories with a catalog taller than the pane
- **When** the user is idle
- **Then** the catalog scroller’s `scrollbar-width` is `none` (no reserved lane)
- **When** the user scrolls that pane
- **Then** a thin overlay thumb is visible on the pane’s trailing edge

### Scenario: Buttons keep desktop height on a narrow viewport

- **Given** viewport width below `md`
- **When** Add group (`sm`) and the theme icon button (`icon-sm`) are shown
- **Then** Add group is **36px** tall
- **And** the theme button is **32×32px**

### Scenario: Brick income, readable Income tab

- **Given** Home with a positive month net
- **When** the month summary is shown
- **Then** net uses the income token (`text-income`), not Tailwind emerald
- **Given** Categories Income tab is active
- **When** the tab is shown
- **Then** the label stays readable (not solid Brick fill on both background and type)

## Traceability

- Vitest: `apps/web/src/lib/components/ui/button/button-variants.test.ts` (labeled `h-9`; icon `size-9` / `size-8` / `size-10`)
- Playwright: `e2e/visual-system.e2e.ts` (Mist background, Figtree, overlay scrollbar, labeled height)
- Implementation: `apps/web/src/app.css`; Figtree font; card/sheet/dialog elevation; OverlayScrollbars; money/chart classes; remove PalettePreviewBar
- Docs: this folder; `specs/README.md`; `docs/PRODUCT.md`
- Supersedes (labeled Button heights only): 111, 112
- Related: 000 (theme/PWA)

## Related

- Overlay preview that locked the look (removed in this slice)
