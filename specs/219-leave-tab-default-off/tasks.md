# Tasks 219: Leave-tab lock defaults off

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] TDD: `apps/web/src/lib/application/idle.test.ts` — missing keys → 30 + leave-tab off; stored `'true'` stays on
- [x] `DEFAULT_LEAVE_TAB = false`; App / shell defaults follow the constant
- [x] Playwright `e2e/settings.e2e.ts` — checkbox unchecked; hide does not lock until saved on
- [x] PRODUCT + 119 / 156 / README supersede notes
- [x] Commit linking Spec 219
