# Plan 070: Pockets nav + CRUD + Main + order

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** 071–077 (this pack)

## Why

Users need multiple source-of-funds pots (“Pockets”), with a protected Main pot, stable ordering, and a clear Main badge everywhere the pocket appears.

## Scope / edges

**In:** Nav between Activity and Categories; Pockets hub CRUD (name, notes); Main seed/`isMain`; rename Main; indelible Main; Main icon (Lucide `Landmark`); DnD reorder non-Main; shared Main-first ordered list for all pickers.

**Out:** Opening balance (071); goals (072); transfers UI (073); Activity pocket filter (075); row pocket labels (077).

## Approach

- Extend `Account` with `isMain`, `sortOrder`, `notes` (notes may land empty until UI); keep Dexie `accounts` table
- `ensureDefaultAccount` → ensure Main with `isMain: true`
- `listPocketsOrdered()`: Main first, then `sortOrder` ascending
- UI: `PocketsPanel.svelte` + route `#/pockets`; DnD via `svelte-dnd-action` like Categories
- Shared `PocketLabel` (name + optional Main icon) for list + dropdowns

## TDD

- Domain/app: order helpers, refuse delete Main, reorder persistence, migrate existing Main by name/`isMain`
- Playwright: nav, create/rename/delete, Main pinned, DnD order reflected in a picker
