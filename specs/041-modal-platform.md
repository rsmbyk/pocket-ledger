# Spec 041: Modal platform (open lifecycle, emphasize, confirms)

- **ID:** 041
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Fix desktop modal flicker and missing close transitions by binding `open` correctly, keep outside-click stay-open with a non-flickering emphasize cue, and replace native browser `confirm()` with a shared custom confirm dialog for destructive/warn flows.

## Scope

### In scope

1. **Open binding** — transaction Dialog/Sheet stays mounted while the account exists; `open` bound to shell state (like Activity filters). Closing sets `open=false` so exit animation can run before clearing `editing`
2. **Close transition** — intentional close (Close, successful save, confirmed leave, confirmed void) plays the same class of exit animation as other sheets/dialogs (no instant unmount)
3. **Outside click** — do **not** dismiss; `preventDefault` on interact/pointer-outside; emphasize the panel **without** briefly applying closed/`data-closed` styles that cause reopen flicker
4. **Shared ConfirmDialog** — AlertDialog-based; used for:
   - Void transaction (irreversible)
   - Discard unsaved changes on tx sheet
   - Delete category (irreversible)
   - Delete recurring rule / goal (irreversible)
   - Import backup overwrite warn
   - Disable lock warn
5. **No `window.confirm`** in those UI paths after this slice

### Out of scope

- Allowing outside-click dismiss
- Toast notifications (042)
- Changing copy beyond irreversible / discard clarity
- Filter sheet behavior (already correct; reference implementation)

## Domain rules

- None (presentation / chrome). Void and delete domain rules unchanged.

## Acceptance scenarios

### Scenario: Close animates

- **Given** an open transaction dialog on desktop
- **When** the user closes via Close (clean form)
- **Then** the panel animates out before the form unmounts / editing clears

### Scenario: Outside click emphasizes without flicker

- **Given** an open transaction dialog
- **When** the user presses outside the panel
- **Then** the dialog stays open, plays emphasize, and does not visibly close-then-reopen

### Scenario: Custom confirm for void

- **Given** void is activated
- **When** the confirm appears
- **Then** it is an in-app AlertDialog (not the browser confirm), stating the action cannot be undone

### Scenario: Decline discard keeps sheet open

- **Given** a dirty create/edit sheet
- **When** the user tries to close and declines the discard confirm
- **Then** the sheet remains open with edits intact

## Traceability

- Vitest: n/a (or thin ConfirmDialog unit if extracted)
- Playwright: polish / transactions (outside click; confirm role); More destructive flows
- Implementation: `AppShell.svelte`; `QuickAddSheet.svelte`; `CategoriesPanel.svelte`; `MorePanel.svelte`; `ConfirmDialog.svelte`; shadcn AlertDialog
- Depends on: 037, 038, 015; enables 039 void/delete presentation and 040 delete warn
