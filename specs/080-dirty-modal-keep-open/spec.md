# Spec 080: Dirty modal keep-open on discard

- **ID:** 080
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When a modal/sheet has **unsaved changes** and the user tries to dismiss it (outside click, Escape, Close), the **host stays open** under the discard confirm. Canceling discard leaves the form usable; confirming discard closes cleanly with no stuck `open` / scroll-lock.

## Scope

### In scope

1. **Prevent-then-warn:** on a dirty dismiss attempt, **prevent the parent modal from closing** first (interact-outside / Escape `preventDefault`, and do not apply `open = false`), **then** open the discard ConfirmDialog. Never close-then-reopen the host.
2. **Transaction Add/Edit** (`QuickAddSheet`): primary fix target for outside / Escape / Close / `onOpenChange(false)`
3. **Activity filters** sheet: align with prevent-then-warn if it currently relies only on reassert; verify no regression
4. Any other dirty-guarded modal/sheet with discard warn: same contract
5. **Cancel discard:** host was never closed — remains open and interactive; no stuck open / scroll-lock
6. **Confirm discard:** host closes cleanly; Add/Edit can open again immediately

### Out of scope

- Forms that do not yet have a dirty discard warn (pocket/category create) — adding discard to those is a follow-up unless already present
- Inline field errors (079)
- Changing discard dialog copy or chrome (057)
- Removing outside-click-to-close (044 stands)

## Domain rules

- None (UI open-state only)
- Controlled `open` must not stay `true` while the panel is visually gone after cancel, and must not stay `true` after confirm discard

## Acceptance scenarios

### Scenario: Dirty outside prevents close then warns

- **Given** Add transaction is dirty
- **When** the user presses outside the panel
- **Then** the transaction Dialog/Sheet does not close (no close animation / unmount)
- **And** the discard confirm appears on top

### Scenario: Cancel discard keeps editing

- **Given** discard confirm is open over a dirty tx sheet
- **When** the user cancels (Keep editing / Cancel)
- **Then** the discard confirm closes
- **And** the transaction sheet remains open with the unsaved values
- **And** the user can open other modals after a later clean close (no stuck open)

### Scenario: Confirm discard closes cleanly

- **Given** discard confirm is open over a dirty tx sheet
- **When** the user confirms Discard
- **Then** the sheet closes
- **And** Add transaction can be opened again immediately

### Scenario: Filters dirty dismiss unchanged

- **Given** dirty Activity filter draft on the filters sheet
- **When** the user tries to close
- **Then** discard warn appears and the filters sheet stays open until confirm or cancel (existing behavior)

## Traceability

- Playwright: dirty outside → confirm + sheet visible; cancel → sheet open; discard → reopen Add
- Implementation: `QuickAddSheet.svelte` (primary): preventDefault interact-outside / Escape while dirty, then open discard; audit `AppShellChrome` filters path to match prevent-then-warn
- Restores Spec 044 “decline keeps sheet open” for outside dismiss

## Related

- 044, 045, 055, 057, 079
