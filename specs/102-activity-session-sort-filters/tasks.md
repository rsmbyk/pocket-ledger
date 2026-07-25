# Tasks 102: Activity session sort + filters persistence

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/shared/activity-list-session.test.ts` — round-trip sort+filters; unknown sort → default; malformed → defaults; draft not stored separately
- [ ] **Green** `src/lib/shared/activity-list-session.ts`
- [ ] Wire read on init + write on `activitySort` / `applied` change in `src/lib/ui/AppShellChrome.svelte`
- [ ] Optional Playwright: apply sort/filter → reload → assert restored
- [ ] `npm run check` + unit (+ e2e if added)
- [ ] Traceability in `./spec.md`
- [ ] Cross-link note on Specs 045 / 064: tab-session persistence superseded by 102
- [ ] Commit with pack
