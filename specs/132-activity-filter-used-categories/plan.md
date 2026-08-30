# Plan 132: Activity category filter used-only

## What

Activity’s category filter lists only categories that appear on at least one ledger transaction (**including voided**). Hide the Category control when there are no transactions, or no transaction has a user `categoryId`. Transaction-sheet picker stays the full visible catalog.

## Why

The filter currently offers the entire stock catalog. Most options never match a row. An empty ledger still shows a Category dropdown that does nothing useful.

## Scope

- Pure helper: used category ids from all txs (voided included)
- Activity filter CategoryPicker input lists only those ids (plus Uncategorized / Admin Fee when those sentinels are in use **and** the control is shown)
- Hide label + picker when no txs or no user categoryId; snap draft/applied category to All
- Type Transfer still disables the control when it is visible (107)

## Out of this slice

- Tx add/edit picker (123/107 full catalog minus hidden)
- 130 search matcher (applies to whatever list is passed in)

## Edges

1. Virgin ledger: no Category control.
2. Only uncategorized / transfer-without-user-category: still hidden.
3. One Salary tx (even if later voided): control appears; picker lists Salary (and Uncategorized if any null-category txs exist).
4. Hidden category still on a voided tx: still listed in the Activity filter.
5. After the last categorized tx is gone: control hides; filter is All.
