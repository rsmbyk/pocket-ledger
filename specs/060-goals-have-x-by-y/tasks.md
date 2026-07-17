# Tasks 060: Goals have X by Y

- **Status:** Draft (blocked on Accept)
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest domain** `src/lib/domain/goals.test.ts`:
  - [ ] Progress: 0 / partial / exact 100% / over target (capped display)
  - [ ] Remaining: positive / zero / overfunded
  - [ ] Days: future / today / overdue
  - [ ] Pace: only when remaining > 0 and days > 0
  - [ ] Sort nearest `targetOn`; same-day tie-break
  - [ ] Validation: bad target / bad date
- [ ] **Green domain** helpers in `src/lib/domain/goals.ts`
- [ ] **Red Vitest application** `src/lib/application/goals.test.ts`:
  - [ ] create/update with `targetOn`; list exposes deadline
  - [ ] delete; empty list
- [ ] **Green application**
- [ ] **Red Playwright** `e2e/goals.e2e.ts`:
  - [ ] Create goal with amount + date; More shows balance progress + time
  - [ ] Two goals → nearest first
  - [ ] Home strip absent with zero goals; present after create; nearest shown; tap → More
  - [ ] Delete last goal → strip gone
- [ ] **Green UI** More + Home strip
- [ ] Retire “Set saved” e2e in `e2e/base-features.e2e.ts`
- [ ] Note Spec 005 superseded
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
