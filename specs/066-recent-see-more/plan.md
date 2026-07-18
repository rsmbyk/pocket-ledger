# Plan 066: Recent see more → Activity

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Home Recent only shows five rows. Users need a clear path to the full Activity list whether or not more txs exist beyond the slice.

## Scope / edges

**In:** Always-visible “See more in Activity” control on Recent card; navigates to Activity.

**Out:** Changing Recent cap; deep-linking filters.

## Approach

- Footer control in Recent `Card.Content` in `AppShellChrome.svelte`
- `data-testid="recent-see-more"`

## TDD

- **Red Playwright** first: control visible on empty Home and with txs; click → Activity panel / hash
- Green UI
