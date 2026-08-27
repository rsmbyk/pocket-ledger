# Spec 118: Cloud Run web + path-filtered Actions; retire Cloudflare

- **ID:** 118
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Host the static web app on GCP Cloud Run, deploy it independently of the API, and stop using Cloudflare as production.

## Scope

### In scope

1. npm workspaces: `apps/web` (SvelteKit static from Spec 117), `apps/api` (Hono stub — health only)
2. `Dockerfile.web` (and `Dockerfile.api` stub)
3. GitHub Actions: path-filtered deploy — `apps/web/**` does not deploy API; `apps/api/**` does not deploy web
4. Cloud Run web service (Workload Identity Federation)
5. Retire `wrangler` production path; HOSTING.md matches (if 115 already wrote the target, this slice makes it true)
6. `*.run.app` is acceptable; custom domain parked
7. Document: new origin ⇒ empty IndexedDB

### Out of scope

- Google Sign-In, session cookie, CORS for real auth (119)
- Sync API and Postgres ciphertext (121)
- Custom domain
- GCS

## Domain rules

- Web service is static assets only in this slice.
- API stub must not accept ledger data yet.

## Acceptance scenarios

### Scenario: Web-only change does not deploy API

- **Given** path-filtered Actions
- **When** a commit touches only `apps/web/**`
- **Then** the web Cloud Run service is deployed (or the web deploy job runs)
- **And** the API deploy job does not run

### Scenario: API-only change does not deploy web

- **Given** path-filtered Actions
- **When** a commit touches only `apps/api/**`
- **Then** the API job may run
- **And** the web deploy job does not run

### Scenario: Production is not Cloudflare

- **Given** Spec 118 is live
- **When** a user opens the production URL from HOSTING.md
- **Then** it is Cloud Run (`*.run.app` or documented URL), not `*.workers.dev` as the target host

### Scenario: Origin change empties the ledger

- **Given** a user who only used the Cloudflare origin
- **When** they open the Cloud Run origin
- **Then** IndexedDB is empty unless they import an encrypted backup later (Spec 120)

## Traceability

- Vitest: none required beyond existing
- Playwright: against preview still; optional smoke of `/` on preview
- Implementation: `apps/web`, `apps/api`, Dockerfiles, `.github/workflows/deploy-*.yml`, `docs/HOSTING.md`, remove or archive wrangler prod

## Related

- 115 docs
- 116 CI (keep CI separate from deploy)
- 117 Kit
- 119 auth on API
