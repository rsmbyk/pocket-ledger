# Tasks 112: Mobile compact button heights

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] Button `sm`: `h-10 md:h-8` in `src/lib/components/ui/button/button.svelte`
- [ ] Button `icon-sm`: `size-10 md:size-8` in the same file
- [ ] Leave `xs` / `icon-xs` and Spec 111 primary sizes unchanged
- [ ] `npm run check` clean
- [ ] Manual: narrow viewport — `sm` / `icon-sm` ≈ 40px; `md+` ≈ 32px; `default` still ≈ 44px on mobile
- [ ] Playwright: deferred
- [ ] Update `specs/README.md` status → Accepted when landing
- [ ] Commit + draft PR linking Spec 112
