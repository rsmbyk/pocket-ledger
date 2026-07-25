# Tasks 103: Modal first-input autofocus

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest (browser):** `src/lib/ui/focus-first-text-field.svelte.test.ts` — prefers text/textarea/select; skips button/checkbox/date/disabled/readonly; returns false when none
- [x] **Green** `src/lib/ui/focus-first-text-field.ts`
- [x] Wire `onOpenAutoFocus` in `src/lib/components/ui/dialog/dialog-content.svelte` and `src/lib/components/ui/sheet/sheet-content.svelte`
- [x] Playwright: `e2e/modal-focus.e2e.ts` — add tx / category / pocket / show-money / confirm / filters sheet
- [x] `npm run check` + unit + e2e for this slice
- [x] Traceability in `./spec.md`
- [x] Commit with pack
