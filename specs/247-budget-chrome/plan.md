# Plan 247: Budget form/details chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 246

## What

Polish the pocket-details budget form and list: disable Select all when every category is already checked, Landmark on pocket-wide titles, a richer list sort, disable Restart when the window already starts today, Applies-to search, and even gaps around Hard/Monthly badges.

## Why

246 shipped a working cap. The form still lets you click Select all after it has done nothing, Restart after it would be a no-op, and a long unsearchable picker. The list treated a 150% category row as more urgent than a pocket-wide cap, and badge spacing was uneven.

## Out of this slice

- Sticky groups / unique Applies to / Pockets-list budget preview (248)
