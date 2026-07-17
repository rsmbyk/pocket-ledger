# Tasks 060: Goals have X by Y

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Vitest domain** `src/lib/domain/goals.test.ts`:
  - [x] Progress: 0 / partial / exact 100% / over target (capped display)
  - [x] Remaining: positive / zero / overfunded
  - [x] Days: future / today / overdue
  - [x] Pace: only when remaining > 0 and days > 0
  - [x] Sort nearest `targetOn`; same-day tie-break
  - [x] Validation: bad target / bad date
- [x] **Green domain** helpers in `src/lib/domain/goals.ts`
- [x] **Red Vitest application** `src/lib/application/goals.test.ts`:
  - [x] create/update with `targetOn`; list exposes deadline
  - [x] delete; empty list
- [x] **Green application**
- [x] **Red Playwright** `e2e/goals.e2e.ts`:
  - [x] Create goal with amount + date; More shows balance progress + time
  - [x] Two goals → nearest first
  - [x] Home strip absent with zero goals; present after create; nearest shown; tap → More
  - [x] Delete last goal → strip gone
- [x] **Green UI** More + Home strip
- [x] Retire “Set saved” e2e in `e2e/base-features.e2e.ts`
- [x] Note Spec 005 superseded
- [x] `npm run check` + unit + e2e
- [x] Traceability in `./spec.md`
