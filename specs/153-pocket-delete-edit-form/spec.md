# Spec 153: Delete pocket from the edit form

- **ID:** 153
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Relocate pocket delete to the **edit** form with an honest blocked path: if the pocket may be deleted, confirm a dangerous wipe; if not, a popover lists **every** reason in plain language (no counts). The Pockets list stays a roster (149).

## Scope

### In scope

1. **Edit only, non-Main** — Danger block **above** Cancel/Save on `pocket-form-dialog` when `formMode === 'edit'` and the pocket is not Main. Button **Delete pocket** (`pocket-delete`), enabled. Create form has no section. Main edit has no section (070: Main cannot be deleted — omit the control, not a disabled button).
2. **Click checks persisted state** (not unsaved form drafts):
   - **Allowed** — not Main, no transactions as `accountId` or `counterAccountId` **including voided**, no **active** goals (152). Open ConfirmDialog **Delete this pocket?** / **Delete** (`pocket-delete-confirm`), danger chrome (057). Confirm: hard-delete the pocket; soft-delete leftover **past** goal rows (152); close the form; if the current path is `/pockets/:id`, `goto('/pockets')`.
   - **Blocked** — do not open the confirm. Popover on the button (`pocket-delete-blocked`) lists **every** reason that applies, **no counts**:
     - *This pocket still has transactions, including voided. Voiding is not enough.* (any tx as source or dest, voided included)
     - *Drop all active goals first.* (any 152 active goal)
3. **Domain copy** — `deletePocket` matches those rules. Stop telling people to “remove or void” (today’s error is wrong under 070). Domain still refuses Main if invoked. 152 already refuses active goals and cascade-soft-deletes leftover past rows on a successful delete.
4. **List** — no `pocket-delete` on cards; no list `pocket-delete-confirm` (149 unchanged).

### Out of scope

- Changing 070: voided txs still block; Main still undeletable
- Showing delete on the Pockets list
- Allowing delete of Main (no popover — section hidden)
- Goal create/edit/Drop UI (152)

## Domain / UI rules

- Evaluate at click time against Dexie (same checks as `deletePocket`).
- Popover is bits-ui/shadcn Popover portaled above the dialog (`z` above the modal). Dismiss on outside click / Escape without deleting.
- Confirm copy: title **Delete this pocket?**; body that this cannot be undone (opening, notes, past goals on this pocket go away with the pocket).
- After delete from the list’s edit dialog, stay on `/pockets`. After delete from details edit, replace-navigate to `/pockets` (do not leave a missing-id details shell).
- `clearPocketGoal` is gone with 152; do not revive list Clear.

## Acceptance scenarios

### Scenario: Main has no delete section

- **Given** the Main pocket edit dialog
- **When** it renders
- **Then** there is no `pocket-delete` and no delete danger block
- **And** `deletePocket(main.id)` still rejects

### Scenario: Create has no delete section

- **Given** Add Pocket
- **When** the create dialog renders
- **Then** there is no `pocket-delete`

### Scenario: Empty pocket confirms and leaves details

- **Given** a non-Main pocket with no txs and no active goals, open at `/pockets/{id}`
- **When** the user opens Edit, activates `pocket-delete`, and confirms `pocket-delete-confirm`
- **Then** the pocket is gone
- **And** the URL is `/pockets`
- **And** leftover past goals for that id are soft-deleted

### Scenario: Tx blocker popover, including voided

- **Given** a non-Main pocket with a voided expense and no active goals
- **When** the user activates `pocket-delete`
- **Then** `pocket-delete-confirm` is not shown
- **And** `pocket-delete-blocked` lists *This pocket still has transactions, including voided. Voiding is not enough.*
- **And** it does not mention goals

### Scenario: Active goal blocker

- **Given** a non-Main pocket with no txs and one active goal
- **When** the user activates `pocket-delete`
- **Then** the popover lists *Drop all active goals first.*
- **And** it does not mention transactions

### Scenario: Both blockers

- **Given** a non-Main pocket with a live tx and an active goal
- **When** the user activates `pocket-delete`
- **Then** the popover lists both sentences (transactions first, then goals)
- **And** confirming delete is not offered

### Scenario: List still has no delete

- **Given** the Pockets list with Main and a non-Main pocket
- **When** the cards render
- **Then** there is no `pocket-delete` on a card
- **And** there is no list `pocket-delete-confirm` until the edit-form confirm opens

## Traceability

- Vitest: `apps/web/src/lib/application/accounts.test.ts` — Main; txs including voided; active goals (152); allowed empty; error copy does not say void
- Playwright: `e2e/pockets.e2e.ts`; `e2e/pocket-details.e2e.ts` — Main/create have no section; blocked popover vs confirm; after delete from details, `/pockets`
- Implementation: `PocketsPanel.svelte` (danger block + popover + confirm); `deletePocket` copy; `AppShellChrome.svelte` / navigate after delete from details
- Docs: this folder; `specs/README.md`; `docs/PRODUCT.md` (Pockets delete home)

## Related

- 070 delete rules; 148 relocate later; 149 no list delete; 152 active goals + cascade
