# Plan 248: Sticky groups, unique scope, list preview

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 246

## What

Store a fully checked expense group as a sticky `groupId` so later categories in that group count. Enforce one active Applies-to scope per pocket. Show the pocket-wide budget on the Pockets list, spanning the name+balance column (not the grip).

## Why

246 snapshots child ids, so a new Home category never joins a Home budget. Overlapping pocket-wide rows are confusing. The list already previews goals; a pocket-wide cap belongs there too, at full card width.

## Out of this slice

- Category/group budgets on the Pockets list
- Home preview
- Changing which goal `previewGoal` picks
- Spec 247 form/details chrome (separate PR)
