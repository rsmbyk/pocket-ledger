# Spec 134: Transactions panel (rename + mutations list)

- **ID:** 134
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The Activity hub is named **Transactions**, lives at `/transactions`, and always lists like a bank mutation statement: grouped by `occurredOn` (latest day first), and within a day by `createdAt` (latest first). Sort is gone; Filters stay.

## Scope

### In scope

1. **Copy:** nav (rail + sheet), page title, command palette, Home **See more in Transactions**. Onboarding/docs: “Transactions / Pockets / More”.
2. **URL:** canonical `/transactions`. Visiting `/activity` **replace-navigates** to `/transactions` and shows the same panel. Hash `#/activity` still unsupported (117).
3. **Route id:** `transactions` (replaces `activity` on `AppRoute`). `parsePath('/activity')` and `parsePath('/transactions')` both yield `transactions`. `routeToPath('transactions')` is `/transactions`.
4. **List order (fixed):** `occurredOn` descending → `createdAt` descending → `id`. Always emit date group headers.
5. **Rows:** date on the group header only (no per-row date). Left-column hierarchy is Spec **136**.
6. **Toolbar:** remove Sort (`activity-sort-open` / sort sheet). Filters unchanged in this slice (icon &lt;1280, drawer ≥1280).
7. **Chunked reveal:** always whole-day chunks (069 date-sort path). Reset on applied filters/search only (no sort mode).
8. **Session (102):** persist **filters only**. Ignore leftover `sort`. Keep key `pocket-ledger-activity-list`.
9. **Testids:** keep `activity-list`, `activity-panel`, `activity-filters-*`, `activity-row-*`. Change route-derived ids: `nav-transactions`, `cmd-transactions`. `goToNav` dest is `'transactions'`.

### Out of scope

- Home Recent layout; Home empty “No recent activity”
- Dexie/export rename; Android
- Filter criteria (139–141)
- DateField open path (135)
- Signed amount prefix (137)
- PocketLabel optical align (138)
- Row note/category swap (136)

## Domain rules

- Drop live `ActivitySortMode` from the UI path. `sortTransactions` / `groupActivityByOccurredOn` / `activityListSections` / `nextRevealEndIndex` always use mutation order (no flat `createdAt-desc` list, no `occurredOn-asc`).
- Grouping key = `occurredOn` (ISO day). Groups always constructed when the list is non-empty.
- Within a day, newer `createdAt` first; tie-break `id`.
- Supersedes 064 Sort sheet, 068 “groups only on date sort”, 069 default-sort row chunks, 076 Default per-row date on this list, 101 date-asc secondary, 102 sort persistence (filters remain).

## Acceptance scenarios

### Scenario: Nav and title say Transactions

- **Given** the shell is unlocked
- **When** the user opens the Transactions item in the rail or sheet
- **Then** `page-title` is `Transactions`
- **And** the address bar path is `/transactions`
- **And** `activity-panel` (or the list/empty) is shown

### Scenario: Old path redirects

- **Given** a ready ledger
- **When** the user opens `/activity`
- **Then** the URL becomes `/transactions` (replace)
- **And** the Transactions panel is shown

### Scenario: Date groups, latest first

- **Given** txs on `2026-09-02` and `2026-08-01`
- **When** Transactions renders
- **Then** a date header for 2 Sep appears above a header for 1 Aug
- **And** rows under a header do not show a per-row date

### Scenario: Same day by createdAt desc

- **Given** two txs on the same `occurredOn` with different `createdAt`
- **When** the list renders
- **Then** the newer `createdAt` row is first in that group

### Scenario: No Sort control

- **Given** Transactions at any viewport
- **When** the toolbar renders
- **Then** `activity-sort-open` is absent
- **And** Filters remain (button &lt;1280; drawer ≥1280)

### Scenario: See more copy

- **Given** Home Recent
- **When** the footer control renders
- **Then** `recent-see-more` reads `See more in Transactions`
- **And** activating it opens `/transactions`

### Scenario: Command palette

- **Given** the command palette is open
- **When** the Navigate group is shown
- **Then** the item label is `Transactions` (`cmd-transactions`)
- **And** selecting it navigates to `/transactions`

## Traceability

- Vitest: `apps/web/src/lib/domain/activity-filters.test.ts` (always grouped; later day first; same-day `createdAt` desc; reveal never splits a day); `apps/web/src/lib/shared/router.test.ts`; `apps/web/src/lib/shared/activity-list-session.test.ts` (filters only; stray `sort` ignored)
- Playwright: `e2e/activity-filters.e2e.ts` (no sort; date groups on default list); `e2e/router.e2e.ts`; `e2e/desktop-layout.e2e.ts`; `e2e/recent-see-more.e2e.ts`; `e2e/pockets.e2e.ts`; update `goToNav` + leftover `goto('/activity')`
- Implementation: `apps/web/src/lib/shared/router.ts`; `apps/web/src/routes/transactions/+page.svelte`; keep `apps/web/src/routes/activity/+page.svelte` stub; `activity-filters.ts`; `ActivityTable.svelte`; `AppShell.svelte`; `AppShellChrome.svelte`; `AppCommandPalette.svelte`; `activity-list-session.ts`; `docs/PRODUCT.md`; `docs/ARCHITECTURE.md`
- Related: 063, 064, 068, 069, 076, 101, 102, 117

## Related

- 135 DateField; 136 row chrome; 137 amounts; 139–141 filters/range
