# Spec 160: Sidebar header and signed-in footer

- **ID:** 160
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The sidebar brand is a centered logo with **Pocket Ledger** under it. The Main/pocket name is gone from the header. When signed in, a footer stub shows the Google email, highlights on hover like nav, and does nothing on click.

## Scope

### In scope

1. **Header** — In [`AppShellChrome.svelte`](../../apps/web/src/lib/ui/AppShellChrome.svelte) `Sidebar.Header`: vertical stack, `items-center` / `text-center`. Favicon on top, **Pocket Ledger** on the next line. Remove the muted `{account?.name}` / “Main” line. Do not keep the horizontal logo + name row.
2. **Footer** — `Sidebar.Footer` on the rail **and** the same block in the mobile offcanvas. **Only when signed in.** Signed-out: no footer, no placeholder.
3. **Stub** — Show `userEmail` (`sidebar-account`, truncate if long). No avatar, no menu, no `goto` Settings, no sign-out. Click is a no-op. Hover and keyboard focus use nav accent: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`. Not `data-active` / current route.
4. Cloud Sync (154) still owns sessions and sign-out. This footer does not duplicate those actions.

### Out of scope

- Account switcher / menu
- Avatar
- Sign-out or Cloud Sync redesign
- Changing nav items (Settings label is 154)

## Domain / UI rules

- Header is brand only; pocket identity stays on Pockets / details (148).
- Footer is not a `Sidebar.MenuButton` that navigates. A `div`/`button type="button"` with hover chrome and no action is fine; if it is a button, it must not move the route.
- Email is the Google account email already used on Cloud Sync (“Signed in as …”).

## Acceptance scenarios

### Scenario: Centered brand, no Main

- **Given** the desktop sidebar
- **When** the header renders
- **Then** the favicon is centered above the words Pocket Ledger (also centered)
- **And** the Main (or renamed Main) pocket name is not in the header

### Scenario: Footer only when signed in

- **Given** signed out
- **When** the rail and mobile menu render
- **Then** there is no `sidebar-account`
- **Given** signed in as `ada@example.com`
- **When** the rail renders
- **Then** `sidebar-account` shows `ada@example.com`
- **When** the user activates it
- **Then** the path does not change
- **And** hover uses sidebar accent (same tokens as nav items)

## Traceability

- Vitest: none
- Playwright: `e2e/router.e2e.ts` or `e2e/base-features.e2e.ts` — no pocket name in sidebar header; footer absent signed-out; present with email when fake-signed-in if e2e covers sign-in
- Implementation: `AppShellChrome.svelte` Sidebar.Header / Footer
- Docs: none required beyond this folder

## Related

- 013 shell; 083 header subtitle; 119 Google email; 154 Cloud Sync
