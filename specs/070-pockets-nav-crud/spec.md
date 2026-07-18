# Spec 070: Pockets nav + CRUD + Main identity + order

- **ID:** 070
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add a **Pockets** hub (user-facing name for accounts/pots) with create/rename/delete, a protected **Main** pocket that can be renamed but never deleted, a **Main icon** wherever that pocket is shown, and a persisted order (Main always first; others DnD-reorderable) shared by every pocket selector.

## Scope

### In scope

1. Shell nav item **Pockets** between **Activity** and **Categories**; hash route `#/pockets`
2. Pockets list panel: create / edit (name, notes) / delete with confirms
3. Auto-ensure one **Main** pocket (`isMain`); default name `Main` when seeding
4. Main **can be renamed**; Main **cannot be deleted** — Main row has **no** delete control (omit trash, not merely disabled)
5. **Main icon:** Lucide **`Landmark`** beside the pocket name on Pockets list, and on every pocket dropdown/picker that shows that pocket (filters/add/transfer land in later specs but must use the same label helper)
6. **DnD reorder** of non-Main pockets on the Pockets list (`svelte-dnd-action`); Main not draggable and always listed first
7. Persist `sortOrder` for non-Main; `listPocketsOrdered()` is the single source for list + all selectors
8. Delete non-Main only when no transactions reference it as `accountId` or `counterAccountId` (voided still count as references — user must not orphan history); refuse with clear message otherwise
9. **List chrome:** no outer outlined shell wrapping all pockets; **each pocket in its own card**; `pocket-add` sits **above** the list with visible label **Add Pocket** (shell page title already names the panel)
10. Pocket create/edit **Save** disabled when the form has **no changes** (create: requires a non-empty name; edit: dirty vs values when the dialog opened)

### Out of scope

- Opening balance / derived balance display (071)
- Pocket goals (072)
- Transfer create UI (073)
- PRODUCT.md full rename pass (074)
- Activity pocket filter (075)
- Showing pocket under amount on rows (077) — icon rules for Main still apply when 077 ships via shared label

## Domain rules

- Storage table remains `accounts`; UI copy says **Pocket** / **Pockets**
- `isMain: true` on exactly one account after ensure; rename does not clear `isMain`
- Ordered list: Main first; remaining sorted by `sortOrder` ascending, then stable by `createdAt` / `id` if tied
- Reorder writes new `sortOrder` values for the non-Main sequence only
- Main icon is shown iff `isMain`, not by comparing name to `"Main"`

## Acceptance scenarios

### Scenario: Nav placement

- **Given** the app shell
- **When** the user views nav
- **Then** items are Home → Activity → **Pockets** → Categories → More
- **And** choosing Pockets opens `#/pockets`

### Scenario: Seed Main

- **Given** an empty ledger
- **When** the app ensures default pocket
- **Then** one pocket exists with `isMain`, default name `Main`, and Main icon in the Pockets list

### Scenario: Rename Main keeps identity

- **Given** the Main pocket
- **When** the user renames it to `Household`
- **Then** the list shows `Household` with the Main (`Landmark`) icon
- **And** `isMain` remains true

### Scenario: Cannot delete Main

- **Given** the Main pocket
- **When** the Pockets list renders
- **Then** the Main row has **no** `pocket-delete` control
- **And** domain `deletePocket` still refuses Main if invoked

### Scenario: Simple list chrome

- **Given** the Pockets panel
- **When** it renders
- **Then** there is no single outer outlined container wrapping all pockets
- **And** each pocket appears in its own card
- **And** `pocket-add` appears above the list with the label **Add Pocket**

### Scenario: Save disabled when unchanged

- **Given** the user opens edit on a pocket without changing fields
- **When** the form is shown
- **Then** `pocket-save` is disabled
- **And** after changing the name, Save becomes enabled
- **And** on create, Save stays disabled until a non-empty name is entered

### Scenario: Create and delete empty pocket

- **Given** Main exists
- **When** the user creates pocket `Vacation` and later deletes it with no txs
- **Then** create succeeds and delete removes it after confirm

### Scenario: DnD order and pickers

- **Given** Main plus pockets A then B in list order
- **When** the user drags B above A on the Pockets list
- **Then** list order is Main, B, A
- **And** any pocket dropdown shows the same order
- **And** Main remains first and was not draggable

### Scenario: Main icon in dropdown

- **Given** a pocket selector listing Main (possibly renamed)
- **When** options render
- **Then** the Main option shows the `Landmark` icon beside its name; non-Main options do not

## Traceability

- Vitest: pocket order helpers; delete/Main guards; ensure Main / `isMain` migration
- Playwright: nav; CRUD; Main rename + icon; no Main delete; simple list + Add; Save dirty; DnD + picker order
- Implementation: `account.ts` / accounts app + repo; `router.ts`; `AppShellChrome.svelte`; `PocketsPanel.svelte`; shared pocket label helper

## Related

- Specs 071–077; Categories DnD (040)
