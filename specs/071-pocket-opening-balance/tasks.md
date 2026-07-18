# Tasks 071: Pocket opening balance + derived balance

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] **Red Vitest:** `src/lib/domain/pocket-balance.test.ts` — opening + later txs; before as-of excluded; voided; income/expense; transfer sides (can stub transfer shape before 073 UI)
- [ ] **Green** derivation + account fields + app APIs
- [ ] **Red Playwright:** opening on create/edit; list balance
- [ ] **Green** Pockets UI + Home all-pockets balance
- [ ] `npm run check` + unit + e2e
- [ ] Traceability in `./spec.md`
- [ ] Commit with pack
