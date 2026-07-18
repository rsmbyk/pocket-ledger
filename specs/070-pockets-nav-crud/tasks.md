# Tasks 070: Pockets nav + CRUD + Main + order

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/domain/account.test.ts` (or `pockets-order.test.ts`) — Main-first order; reorder non-Main; `isMain` not name-based
- [ ] **Red Vitest:** app guards — refuse delete Main; refuse delete when txs reference pocket
- [ ] **Green** domain + application + Dexie fields (`isMain`, `sortOrder`, `notes`)
- [ ] **Red Playwright:** `e2e/pockets.e2e.ts` — nav order; create/rename/delete; Main icon; DnD updates picker order
- [ ] **Green** UI: route, `PocketsPanel`, shared label, DnD
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit with pack (after Accept)
