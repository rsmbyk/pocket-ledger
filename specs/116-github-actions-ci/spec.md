# Spec 116: Restore GitHub Actions CI

- **ID:** 116
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Run lint/typecheck, Vitest, and Playwright on GitHub Actions so PRs fail in CI instead of only on a laptop.

## Scope

### In scope

1. Workflow on `pull_request` and `push` to `main`
2. `npm ci`, `npm run check`, `npm run test:unit:run`, Playwright browsers, `npm run test:e2e`
3. PROCESS.md / TESTING.md note that CI is used again (full hosting rewrite stays Spec 115/118)

### Out of scope

- Deploy to Cloud Run or Cloudflare
- Path-filtered web vs API deploy (Spec 118)
- Changing test suites themselves except workflow wiring

## Domain rules

- None (ops)

## Acceptance scenarios

### Scenario: PR runs CI

- **Given** a pull request against `main`
- **When** GitHub Actions runs
- **Then** check, unit, and e2e jobs run (or one job with those steps)
- **And** a failing unit test fails the workflow

### Scenario: No deploy from this workflow

- **Given** Spec 116 is implemented
- **When** CI succeeds on `main`
- **Then** this workflow does not deploy Cloud Run or Wrangler (deploys remain Spec 118 / current Cloudflare until then)

## Traceability

- Vitest: existing `npm run test:unit:run`
- Playwright: existing `npm run test:e2e`
- Implementation: `.github/workflows/ci.yml`; `docs/PROCESS.md` CI sentence; `docs/TESTING.md` if it claims Actions unused

## Related

- 115 docs
- 118 Cloud Run deploy filters
