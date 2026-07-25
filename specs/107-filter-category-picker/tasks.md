# Tasks 107: Filter category dropdown + type coupling

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/domain/activity-filters.test.ts` — filter by type `transfer`; `isCategoryFilterCompatible` / `resolveCategoryIdForType` (or equivalent) clears incompatible selections
- [x] **Green** extend `ActivityTypeFilter` + helpers in `src/lib/domain/activity-filters.ts`
- [x] Shared `src/lib/ui/CategoryPicker.svelte` (DropdownMenu; groups; All / Admin Fee / Uncategorized; disabled)
- [x] Wire filters in `src/lib/ui/AppShellChrome.svelte` — Transfer type option; CategoryPicker; type→category coupling
- [x] Refactor `src/lib/ui/QuickAddSheet.svelte` onto CategoryPicker
- [x] Playwright: `e2e/activity-filters.e2e.ts` — type Transfer; category menu groups / narrowing; helpers for DropdownMenu
- [x] Playwright: `e2e/transfer-admin-fee.e2e.ts` — Admin Fee via CategoryPicker (not native select)
- [x] `npm run check` + unit + e2e green
- [x] Traceability in `./spec.md`
- [x] Commit + draft PR linking Spec 107
