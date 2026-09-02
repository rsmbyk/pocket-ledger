# Plan 142: Transactions range picker + sticky chrome band

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Replace the header Month | Custom cluster with a single button that opens a hand-rolled Month / Manual picker. Move date, search, Filters, and Add Transaction into a second sticky band flush under the page title bar.

## Why

The date control should not live in the app toolbar. Search and Add should stay on screen while scrolling, same as the date trigger. One picker holds both month pick and a from–to day grid.

## Scope

- Sticky title bar vs sticky chrome band (separator, flush)
- Single trigger; popover with Month (12-grid) and Manual (From/To + one day calendar)
- Domain stays 141
- No calendar npm package

## Out of this slice

- Home month chevrons
- Sticky date-group list headers
- All-time list
