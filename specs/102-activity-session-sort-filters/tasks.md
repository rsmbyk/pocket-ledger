# Tasks 102: Activity session sort + filters persistence

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest:** `src/lib/shared/activity-list-session.test.ts` — round-trip sort+filters; unknown sort → default; malformed → defaults; draft not stored separately
- [x] **Green** `src/lib/shared/activity-list-session.ts`
- [x] Wire read on init + write on `activitySort` / `applied` change in `src/lib/ui/AppShellChrome.svelte`
- [x] Optional Playwright: apply sort/filter → reload → assert restored — deferred (Vitest covers storage helper)
- [x] `npm run check` + unit (+ e2e if added)
- [x] Traceability in `./spec.md`
- [x] Cross-link note on Specs 045 / 064: tab-session persistence superseded by 102
- [x] Commit with pack
