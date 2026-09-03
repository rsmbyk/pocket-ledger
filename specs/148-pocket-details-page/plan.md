# Plan 148: Pocket details page

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

Add a `/pockets/:id` details dashboard: click a Pockets list card to open a stack of infographic cards (optional descriptions, balance, optional opening, optional goal, pocket-scoped month summary, latest 10 txs). Pencil on the list still opens the existing edit dialog.

## Why

The list is a roster. There is no place to read one pocket — opening, goal, this month’s money, and its latest activity — without opening Edit.

## Scope

- Nested path `/pockets/:id`; Pockets nav stays highlighted; Back goes to `/pockets`
- List card (not pencil/delete/clear-goal/drag handle) is the hit target
- Card stack in Home scan order; hide opening/goal when unset
- Latest 10 like Home Recent; Add Transaction pre-fills this pocket; See more applies pocket-only Transactions filters (default month range)
- Month summary scoped to this pocket; independent month cursor from Home
- Unknown id replace-navigates to `/pockets`

## Out of this slice

- Inline edit; delete from details
- Changing Home, list layout, or pocket money rules
- All-time Transactions range; 2-col grid; Android

## Approach

- Extend `parsePath` so `/pockets/:id` is still `pockets`; add `parsePocketId`
- Kit stub `apps/web/src/routes/pockets/[id]/+page.svelte`
- `PocketDetailsPanel` switched from `PocketsPanel` when `pocketId` is set
- Domain: optional pocket scope on `buildMonthSummary`; latest-10 helper; See more session helper
- Reuse `MonthSummary.svelte`, `TransactionListRow`, existing edit dialog, hide-amounts preference
