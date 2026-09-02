# Plan 143: Range picker Apply, Close, and To-hover preview

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

The Transactions date popover edits a **draft**. Apply commits it to the list; Close, Escape, and outside click discard. While picking To, hovering a day previews From→that day on the grid only.

## Why

Live-applying every click made it too easy to filter the list before the range was finished. Apply/Close match Filters. Hover preview shows the span before the second click.

## Scope

- Draft vs committed range in `TransactionRangePicker`
- Footer Close + Apply on Month and Manual
- To-hover highlight (snap if hover is before From)
- 142 live-apply superseded; chrome band unchanged

## Out of this slice

- 141 session shape; Filters From/To
- Calendar npm package
