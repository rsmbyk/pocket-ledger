# Spec 245: Shell loading skeletons

- **ID:** 245
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

While the signed-in-or-local **shell** is waiting on ledger data, keep sidebar and header and show a **layout-matching skeleton** for the current path. Content must not pop in from an empty stage. Do not invent a wait when the destination is already ready.

## Scope

### In scope

1. Split boot into **session ready** vs **ledger ready**. Centered spinner (221) only while the session is unknown (cannot tell gate vs shell).
2. Shell + ledger not ready: real nav and title bar; stage is a skeleton for `/`, `/transactions`, `/plans`, `/pockets`, `/pockets/:id`, `/categories`, `/settings`. Nav during this wait switches which skeleton is shown.
3. Unlock must not paint empty lists / a missing month card before `refreshLedger` finishes — `ledgerReady` stays false until then.
4. Home month prev/next: keep the Month card (title + arrows, arrows disabled); pulse amounts / charts / footer until the new summary arrives. Do not blank the rest of Home.
5. `/pockets/:id` before the pocket exists in `accounts` (ledger still loading): pocket-details skeleton. Do not redirect to the list until ledger ready and the id is still missing.
6. After `ledgerReady`, paint real content immediately. 30s background sync does not re-skeleton.

### Out of scope

- Unlock, onboarding, recovery, screensaver (stay full-screen)
- Sheets, dialogs, command palette, empty-state copy
- Artificial minimum skeleton time on ready route changes
- Changing filter, list, or chart behavior
- Android

## Domain rules

- `shouldShowStartupSpinner` is true iff session is not ready.
- `shouldShowShellSkeleton` is true iff session is ready, the user is not on a gate, and ledger is not ready.
- `shellNeedsLedger` is false while locked, onboarding incomplete, or account recovery / pending reset without a DEK.
- Skeletons use muted pulse blocks only — no fake money, names, or sentences.
- Home skeleton omits a Plans card (real Home hides Plans when empty). Pocket-details skeleton omits Descriptions (conditional).
- Assistive name on the stage skeleton is “Loading” (`role="status"`, `aria-busy="true"`).

## Acceptance scenarios

### Scenario: Spinner only while session is unknown

- **Given** the app has not finished reading lock / cloud session
- **When** the first paint runs
- **Then** the centered loading icon is shown (221)
- **And** the shell skeleton is not shown

### Scenario: Shell waits with a Home-shaped skeleton

- **Given** a signed-out unlocked session whose ledger is still opening
- **When** the shell mounts
- **Then** primary nav and the page title are visible
- **And** the stage is a Home skeleton (`shell-stage-skeleton`, `shell-skeleton-home`) with Balance, Month, and Recent pulses
- **And** there is no Plans skeleton card
- **And** real Home (`home-panel`) is not shown yet

### Scenario: Nav during ledger wait switches the skeleton

- **Given** the shell is showing a Home skeleton
- **When** the user opens Transactions in the nav
- **Then** chrome stays
- **And** the stage becomes a Transactions skeleton (`shell-skeleton-transactions`)
- **And** real Transactions (`activity-panel`) is not shown yet

### Scenario: After ledger ready the real page is shown

- **Given** a fresh signed-out ledger
- **When** ledger refresh finishes
- **Then** Home is shown
- **And** `shell-stage-skeleton` is gone
- **And** there is no leftover Starting up copy

### Scenario: Unlock does not flash empty Home

- **Given** a locked device ledger
- **When** the user unlocks successfully
- **Then** the shell skeleton is shown until refresh finishes
- **And** Home does not appear with an empty Recent list and no month card before that

### Scenario: Month change keeps the card

- **Given** Home with a visible month summary
- **When** the user goes to the previous or next month
- **Then** `month-summary` stays mounted
- **And** the card body is a pulse placeholder until the new summary arrives (`month-summary-skeleton`)
- **And** prev/next are disabled while that wait lasts
- **And** Balance and Recent stay as real content

### Scenario: Pocket details waits instead of redirecting

- **Given** the address bar is `/pockets/:id` and ledger is not ready
- **When** the shell paints
- **Then** the stage is a pocket-details skeleton (`shell-skeleton-pocket-details`)
- **And** the app does not replace the URL with `/pockets` until ledger is ready and that id is still missing

### Scenario: Ready route change is instant

- **Given** ledger is already ready on Home
- **When** the user opens Settings
- **Then** Settings content is shown without a skeleton beat

### Scenario: Background sync does not skeleton

- **Given** the shell is showing real Home
- **When** the 30s pull applies
- **Then** `shell-stage-skeleton` is not shown

## Traceability

- Vitest: `apps/web/src/lib/shared/shell-loading.test.ts`; `apps/web/src/lib/ui/ShellStageSkeleton.svelte.test.ts`; `apps/web/src/lib/ui/MonthSummary.svelte.test.ts`
- Playwright: `e2e/scaffold.e2e.ts`; `e2e/month-charts.e2e.ts` (month card stays)
- Implementation: `shell-loading.ts`; `ShellStageSkeleton.svelte`; `App.svelte`; `AppShell.svelte`; `AppShellChrome.svelte`; `MonthSummary.svelte`

## Related

- 221 startup spinner — **session-unknown only**; AppShell `!ready` splash superseded
- 234 / 235 / 238 xl column layouts the skeletons approximate
