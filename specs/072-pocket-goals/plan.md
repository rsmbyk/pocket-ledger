# Plan 072: Pocket goals; retire Home/More goals

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070, 071

## Why

Goals belong on pots. Retire the global goals strip and More Goals section; migrate at most one legacy goal onto Main.

## Scope / edges

**In:** One optional goal per pocket (target amount; target date optional); progress from pocket balance; largest time unit remaining; remove Home strip + More Goals; migration rule.

**Out:** Multiple goals per pocket; Home multi-goal list.

## Approach

- Store goal fields on pocket (`goalTargetMinor`, `goalTargetOn` nullable) **or** one-row-per-pocket in goals table with `accountId` — prefer **fields on account** for “one optional goal” simplicity; clear legacy `goals` table after migrate
- Time remaining: years → months → weeks → days (largest unit that fits)
- Migrate: among old goals, pick nearest `targetOn`; attach to Main if Main has no goal; drop others from live DB (backup JSON may still contain them until next export)

## TDD

- Progress %; optional deadline; time-unit helper; migration selection
