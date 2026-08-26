# Plan 116: Restore GitHub Actions CI

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 115 (docs); Spec 118 (path-filtered deploy)

## Why

PROCESS still says Actions is unused because billing blocked workflows. CI should run check, unit, and e2e on PRs so `main` stays deployable before Cloud Run cutover.

## Approach

Add `.github/workflows/ci.yml` on pull_request and push to `main`: `npm ci`, `npm run check`, `npm run test:unit:run`, Playwright install + `npm run test:e2e`. No production deploy in this slice (that is Spec 118).

## Scope / edges

**In:** CI workflow only.

**Out:** Cloud Run deploy, workspaces split, app behavior.
