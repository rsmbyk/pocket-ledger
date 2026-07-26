# Tasks 112: Mobile compact button heights

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Button `sm`: `h-10 md:h-8` in `src/lib/components/ui/button/button.svelte`
- [x] Button `icon-sm`: `size-10 md:size-8` in the same file
- [x] Leave `xs` / `icon-xs` and Spec 111 primary sizes unchanged
- [ ] `npm run check` clean
- [x] Manual: narrow viewport — `sm` / `icon-sm` ≈ 40px; `md+` ≈ 32px; `default` still ≈ 44px on mobile (class contract)
- [x] Playwright: deferred
- [x] Update `specs/README.md` status → Accepted when landing
- [ ] Commit + draft PR linking Spec 112
