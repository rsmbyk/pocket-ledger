# Plan 062: Codebase test coverage audit

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Ronald wants the **whole** codebase well tested — no missing behavior cases — not only the Goals redesign.

## Scope / edges

**In:** Inventory domain + application modules and product e2e; fill gaps; full `npm test` green.

**Out:** Line-coverage vanity; visual regression tooling; rewriting UI solely for coverage.

## Approach

1. Matrix every `src/lib/domain/*.ts` and `src/lib/application/*.ts` → test file or explicit deferral
2. Matrix Accepted product capabilities → Playwright
3. Fill known gaps (accounts, month-summary app, goals e2e via 060, etc.)
4. Gate: `npm run check && npm run test:unit:run && npm run test:e2e`
