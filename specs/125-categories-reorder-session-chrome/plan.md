# Plan 125: Categories reorder session and chrome

## What

Finish Categories chrome after Spec 124: reorder is one session across Income and Expenses, Discard is the way out, search hides while reordering, and a few visual nits (search width, header height, chip cursor, toolbar icons, dark-mode tab tint).

## Why

Reorder still belongs to one kind at a time on screen, but users need to shuffle both kinds before Save. The extra Done control duplicates Discard. Search is useless on a group-name list and left the field wider than the catalog. Dark mode washed out the Income/Expenses tint.

## Scope

- Reorder snapshots **both** kinds on enter; tab switches keep both drafts; Save writes both; Discard restores the snapshot and **exits**
- No Done; Reset stays (visible kind → factory stock then customs, stay in reorder)
- Hide and clear search while reordering
- CSS (no extra spec): search/toolbar inset matches the catalog; shorter group headers; default cursor on chip labels; toolbar icon alignment; stronger dark-mode tab fills

## Out of this slice

- Category DnD, group rename/delete, custom icons
- Persisting search text
- Reset applying to both kinds at once
- Auto-save on tab switch

## Edges

1. **Enter reorder:** snapshot income and expense group ids; clear search; hide the search field.
2. **Tab switch in reorder:** no leave confirm; show that kind’s draft list; the other kind’s draft is unchanged.
3. **Dirty:** either kind’s draft differs from the enter snapshot. Save enabled when dirty.
4. **Save:** persist both drafts (existing per-kind `saveCategoryGroupOrder`), exit view mode, search shown (empty).
5. **Discard:** restore both drafts from the snapshot, exit view mode, search shown (empty). No confirm.
6. **Reset:** factory order for the **visible** kind only (123); stay in reorder; dirty if that kind now differs from the snapshot.
7. **Leave Categories** with a dirty session: existing leave confirm; Leave discards both kinds.
8. **Search width:** same horizontal inset as the group-card frame, not full stage while the catalog is inset.
