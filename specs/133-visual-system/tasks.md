# Tasks 133: Visual system (Mist / Ink / Figtree)

Accepted — bake the locked overlay look into product CSS.

## Tokens and type

- [ ] `apps/web/src/app.css` — Mist / Ink tokens, `--radius: 0.4375rem`, `--income`, Brick `--destructive`, elevation vars, Quiet focus, overlay native-scrollbar hide
- [ ] Replace `@fontsource-variable/inter` with `@fontsource-variable/figtree`; `--font-sans` is Figtree
- [ ] PWA `theme_color` / `app.html` / `offline.html` Mist; sync `theme-color` meta when `.dark` toggles

## Chrome

- [ ] Button `default` / `sm` / `lg` → `h-9`; `icon` / `icon-sm` / `icon-lg` → former `md+` squares
- [ ] Card + balance-hero Current+; sheet/dialog Lift
- [ ] Money: `text-income`; charts Soft (mix at rest, full on hover, no dim, no ring)
- [ ] Overlay scrollbar component mounted from `+layout.svelte` (all environments)
- [ ] Delete `PalettePreviewBar.svelte` and the `{#if dev}` hook

## Tests

- [ ] Vitest `apps/web/src/lib/components/ui/button/button-variants.test.ts`
- [ ] Playwright `e2e/visual-system.e2e.ts`
- [ ] Update `e2e/month-charts.e2e.ts` emerald class → `text-income`

## Verify

- [ ] `npm run check`
- [ ] `npm run test:unit:run` (button-variants)
- [ ] `npx playwright test e2e/visual-system.e2e.ts e2e/month-charts.e2e.ts`
- [ ] Manual: Home / Categories / Quick Add light+dark; overlay thumb; labeled vs icon height
