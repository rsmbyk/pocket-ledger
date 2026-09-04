# Spec 152: Multiple goals per pocket

- **ID:** 152
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Attach **many goals** to each pocket instead of one optional field on the account. Users can stack “have X by next month” and “have Y by next year” without rewriting the target when a date hits, and they can still read past dated goals. Drop replaces Clear. Progress is always derived from the ledger (including backdated txs on past goals).

## Scope

### In scope

1. **Goal rows** — Revive Dexie `goals` as live entities: `id`, `accountId`, optional short `description`, `targetMinor`, optional `targetOn` (`YYYY-MM-DD` or null), `createdAt`, `cancelledAt` (Dropped), `deletedAt` (hidden). Never `db.goals.delete`. Ciphertext: description, amounts, dates (same as other ledger secrets). Plain: ids. Index `accountId`. Sync kind `goal` (121). Field-crypto seals `description` (legacy `name` is gone).
2. **Migrate once** — Each pocket with `goalEnabled` and a non-null `goalTargetMinor` becomes one goal (`description` empty, copy target/date, `cancelledAt`/`deletedAt` null). Then stop reading/writing `goalEnabled` / `goalTargetMinor` / `goalTargetOn` for UI. Strip or ignore those account fields on normalize. Import of old backup JSON migrates pocket fields the same way. Do not run the 072 “nearest legacy goal onto Main then clear table” path on already-migrated 152 rows.
3. **Status** (local today = `todayOccurredOn()`):
   - **Active:** `deletedAt` and `cancelledAt` both null, and (`targetOn` is null **or** `targetOn >= today`)
   - **Past:** dated (`targetOn` non-null), and (`targetOn < today` **or** Dropped); shown in the past modal
   - **Hidden:** no-date + Drop → set `cancelledAt` and `deletedAt`; nowhere in UI
4. **Unlimited** goals per pocket. Date min on create/edit = today. Date optional; add or clear while the goal is still active (date not past). Cannot set a date earlier than today.
5. **Progress** (never stored):
   - Active: today’s `derivePocketBalance` (071). Bar + percent on the details card and pockets-list preview (072 chrome).
   - Past, not Dropped: no bar, no percent. Recompute **end of target day** (`occurredOn <= targetOn`; equivalent to `balanceAtDayStart(pocket, dayAfter(targetOn), txs)`) only to set **Achieved** (`balance >= target`) vs **Missed**. A later backdated tx can flip the badge.
   - Dropped: no progress.
6. **Details Goals card** (`pocket-details-goals-card`) — always shown (Recent-style `Card`, not `{#if hasGoal}`). Title **Goals**. Header **Add Goal** (`pocket-details-add-goal`). Empty like Recent (`pocket-details-goals-empty`): title **No goals**, description **Goals you add will show up here.** Active list (`pocket-details-goals-list`): dated closest-first (same day: oldest `createdAt`, then `id`); then no-date, oldest `createdAt` first. Dividers + hover like Recent. Click a row → edit modal. **No status badge on the card.** Hide-amounts (048 / 089) hides money here too. Footer **See past goals** (`pocket-details-see-past-goals`) only if this pocket’s past list is non-empty.
7. **Past modal** (`pocket-past-goals-dialog`) — latest `targetOn` first, then `createdAt` desc, then `id`. Not clickable, not editable, not deletable. Description (omit title if empty/whitespace), target amount, target date, badge **Achieved** / **Missed** / **Dropped**. No bar, no percent.
8. **Pockets list preview** — the **first row of that pocket’s details active list** (nearest dated active, else oldest no-date). Same stack as details ([170](../170-goal-row-percent-end/spec.md)): amounts, date, right-aligned percent, bar. Bar fill color is [171](../171-goal-bar-color-steps/spec.md). No badge. No preview if there are no active goals.
9. **Form** — strip goal fields from pocket create/edit (086 goal checkbox, target, date, helpers). Dedicated add/edit dialog (`pocket-goal-form-dialog`). Optional description (`pocket-goal-description-input`); empty → no title on rows. Required target (`pocket-goal-target-input`); optional date (`pocket-goal-date-input`) with suffix checkbox (`pocket-goal-date-enabled`) like 086. Edit only: danger **Drop goal** (`pocket-goal-drop`) → ConfirmDialog **Drop this goal?** / **Drop** (`pocket-goal-drop-confirm`), danger chrome (057). Dated Drop → past as Dropped (`cancelledAt` set, `deletedAt` null). No-date Drop → hidden. Save disabled when create has no valid target, or edit is unchanged vs open snapshot (034).
10. **Delete pocket (domain)** — `deletePocket` refuses while **active** goals exist. Past and hidden do not block. Deleting an unused pocket sets `deletedAt` on leftover past rows (no hard-delete). UI for delete is 153.

### Out of scope

- Pocket delete UI (153)
- List-card delete / clear-goal chrome
- Badges on the active details card or pockets list
- Budgets; renaming Drop
- Android

## Domain rules

### Shape

```ts
type PocketGoal = {
  id: string;
  accountId: string;
  description: string; // trim; empty = no title
  targetMinor: number; // positive integer (assertGoalTarget)
  targetOn: string | null;
  createdAt: string; // ISO
  cancelledAt: string | null;
  deletedAt: string | null;
};
```

Do not keep legacy `name` / `savedMinor` on new rows. Backup import of old `{ name, targetOn, targetMinor }` without `accountId` is not revived as live UI (072 already migrated those onto Main).

### Classify / sort (names may vary)

- `isHidden(g)` → `deletedAt != null`
- `isDropped(g)` → `cancelledAt != null`
- `isActive(g, today)` → not hidden, not dropped, and (no date or `targetOn >= today`)
- `isPast(g, today)` → not hidden, dated, and (`targetOn < today` or dropped)
- `sortActiveGoals(goals, today)` → active only; dated by `targetOn` asc, then `createdAt` asc, then `id`; no-date after all dated, by `createdAt` asc, then `id`
- `previewGoal(goals, today)` → `sortActiveGoals(...)[0] ?? null`
- `sortPastGoals(goals, today)` → past only; `targetOn` desc, then `createdAt` desc, then `id`
- `goalEndOfDayBalance(pocket, targetOn, txs)` → `balanceAtDayStart(pocket, dayAfter(targetOn), txs)`
- `pastGoalBadge(goal, pocket, txs, today)` → Dropped if dropped; else Achieved if end-of-day balance `>= targetMinor`; else Missed
- Active percent: `goalProgressPercent(targetMinor, derivePocketBalance(...))` (clamp 0–100, `max(0, balance)` as today)

`dayAfter` is calendar `YYYY-MM-DD` + 1 day (UTC date arithmetic like `goal-time`).

### Drop / mutate

- Create: `cancelledAt` and `deletedAt` null. `targetOn` null or `>= today`.
- Update: only **active** goals. May change description, target, date (null or `>= today`). Refuse if the goal is past or hidden.
- Drop: only **active**. Dated → `cancelledAt = now`, `deletedAt` stays null. No-date → `cancelledAt = now` and `deletedAt = now`.
- No Dexie `delete`. `removeGoal` hard-delete is gone.

### Pocket delete (application)

If any **active** goal exists for the pocket, refuse (copy for 153 popover: *Drop all active goals first.*). Otherwise hard-delete the account row as today, and set `deletedAt` (and `cancelledAt` if missing) on remaining goal rows for that `accountId`.

### Crypto / backup / sync

- Seal `description` on write (empty stays empty). Open on read.
- Encrypted backup includes the `goals` array in the new shape.
- Signed-in: PUT/GET `kind: 'goal'` like other entities; Drop/hidden are still rows (not server gravestones unless the whole entity is gone). Soft-delete fields live in the sealed blob.

## Acceptance scenarios

### Scenario: Migrate pocket field to a row

- **Given** a pocket with `goalEnabled`, `goalTargetMinor` `100_000`, `goalTargetOn` `2099-01-01`
- **When** the 152 migrate runs
- **Then** one goal row exists for that pocket with that target and date, empty description, not dropped
- **And** the UI no longer reads the account goal fields

### Scenario: Details card always shown, empty

- **Given** a pocket with no active goals
- **When** details opens
- **Then** `pocket-details-goals-card` is visible
- **And** `pocket-details-goals-empty` shows **No goals**
- **And** `pocket-details-add-goal` is visible
- **And** `pocket-details-see-past-goals` is absent

### Scenario: Active sort and list preview

- **Given** today `2026-09-03` and three active goals: dated `2026-10-01`, dated `2026-12-01`, no-date created earlier than a second no-date
- **When** the details list and pockets-list card render
- **Then** the details order is Oct, Dec, then no-dates oldest first
- **And** the pockets list preview is the October goal (first details row)

### Scenario: Add dated and no-date goals

- **Given** details for Vacation
- **When** the user activates Add Goal, sets target `50_000`, leaves date off, saves
- **Then** an active no-date goal appears on the card
- **When** they add another with date `today` and target `80_000`
- **Then** the dated goal is listed above the no-date goal
- **And** the date control refused a day before today

### Scenario: Click opens edit; empty description has no title

- **Given** an active goal with empty description
- **When** the list row renders
- **Then** there is no title line
- **When** the user activates the row
- **Then** `pocket-goal-form-dialog` opens
- **And** saving an unchanged form is disabled until a field changes

### Scenario: Drop dated vs no-date

- **Given** an active dated goal and an active no-date goal
- **When** the user Drops the dated one and confirms **Drop this goal?**
- **Then** it leaves the card and appears in the past modal with badge **Dropped** (no bar)
- **And** `pocket-details-see-past-goals` is visible
- **When** they Drop the no-date goal
- **Then** it is not on the card and not in the past modal

### Scenario: Past expired live badge

- **Given** a non-dropped goal with `targetOn` yesterday, target `100_000`, and end-of-day balance `100_000`
- **When** the past modal opens
- **Then** the badge is **Achieved**
- **When** a transaction dated on that target day is voided so the end-of-day balance is `90_000`
- **Then** the badge is **Missed** without a bar or percent
- **And** the past row is not clickable

### Scenario: Goal fields gone from pocket form

- **Given** the pocket edit dialog
- **When** it renders
- **Then** there is no `pocket-goal-enabled`, `pocket-goal-target-input`, or `pocket-goal-date-input` on that dialog

### Scenario: Delete pocket domain refuses active goals

- **Given** an empty-of-txs non-Main pocket with an active goal
- **When** `deletePocket` is called
- **Then** it rejects
- **When** that goal is Dropped (hidden or past) and `deletePocket` is called
- **Then** the pocket is gone and leftover past rows are soft-deleted

## Traceability

- Vitest: `apps/web/src/lib/domain/goals.test.ts` (classify, sort, preview, badge, percent); `apps/web/src/lib/domain/pocket-balance.test.ts` (end-of-day / `dayAfter`); `apps/web/src/lib/application/goals.test.ts` (CRUD, drop, migrate, no hard-delete); `apps/web/src/lib/application/accounts.test.ts` (active-goal delete guard + cascade soft-delete)
- Playwright: `e2e/goals.e2e.ts`; `e2e/pocket-details.e2e.ts`; retarget pocket-form goal controls; `e2e/pockets.e2e.ts` list preview
- Implementation: domain goals + pocket-balance helper; Dexie bump + migrate; `application/goals.ts` + repo; `PocketDetailsPanel.svelte`; `PocketsPanel.svelte` (strip form fields, list preview); goal dialog; backup + field-crypto; sync `kind: 'goal'`
- Docs: this folder; `specs/README.md`; `docs/PRODUCT.md` (Goals / Pockets); `docs/DATA_MODEL.md`

## Related

- 072 one pocket goal (superseded for storage/UI); 086 goal checkboxes (removed from pocket form); 148 details goal card (always-on + list); 149 no list Clear; 153 delete UI
