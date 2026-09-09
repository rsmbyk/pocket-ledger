# Tasks 243: Plans filters dirty leave keep-open

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] **Red Playwright:** `e2e/plans.e2e.ts` — mobile; dirty overlay/Escape keep `plans-filters-sheet` + discard; Keep editing; Discard then reopen; clean overlay/Escape close
- [x] **Green:** `onPlanFiltersDismissAttempt` on `plans-filters-sheet` (`preventDefault` while dirty or discard open; ignore floating menu / native picker)
- [x] `npx @sveltejs/mcp svelte-autofixer` on edited `.svelte` files
- [x] `npm run check`
- [x] `npx playwright test e2e/plans.e2e.ts`
