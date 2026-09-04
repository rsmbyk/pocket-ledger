# Spec 178: Production Cloud SQL + Google Sign-In

- **ID:** 178
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Make production signed-in real and durable: Google Identity Services on the Cloud Run web origin, ciphertext in Cloud SQL. Do not show Sign in on production until the API can persist. Local / CI / e2e stay fake Google + in-memory.

## Scope

### In scope

1. Postgres store with the same shape as the in-memory store (users, sessions, wraps, entities; CAS / gravestones / `wrapRev`)
2. Apply [`apps/api/schema.sql`](../../apps/api/schema.sql) on connect (`CREATE TABLE IF NOT EXISTS`)
3. `DATABASE_URL` set → Postgres; unset → in-memory
4. Add `pg` (`node-postgres`) to `@pocket-ledger/api` — no ORM
5. Bake `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` into the web image at Cloud Build time (no trailing slash on the API URL)
6. `cloudConfigured()` is true only when an API URL is set **and** (fake Google **or** a Google client id)
7. API Cloud Run: `WEB_ORIGIN` (web `*.run.app`), `GOOGLE_CLIENT_ID`, `--add-cloudsql-instances` when configured, `DATABASE_URL` from Secret Manager `database-url`. Do **not** set `AUTH_ALLOW_FAKE`. `COOKIE_SECURE` stays default (SameSite=None)
8. Document one-shot GCP ops in [`docs/HOSTING.md`](../../docs/HOSTING.md)

### Out of scope

- Custom domain, VPC / private IP, Terraform
- Local Docker Postgres
- Wipe-account, Cloud lockout
- GIS prompt UX changes
- Android

## Domain / ops rules

- Operator never has the passphrase, hex kit, or raw DEK (unchanged). Server stores ciphertext + wrap envelopes only.
- Production Sign in must not be enabled without Cloud SQL attached on the API (same slice). GitHub vars may be empty until Ronald finishes console ops; empty Google client id keeps the Settings copy “not configured on this build.”
- Known URLs: web `https://pocket-ledger-web-w6fanfnuqa-uc.a.run.app`; API `https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app` (confirm hash after first Iowa deploy). Jakarta `-et` origins are retired after cutover (empty IndexedDB on the new URL).
- OAuth consent stays **Testing**; add Ronald’s Gmail as a test user. Do not start Google verification.
- GIS Web client authorized JavaScript origin = Iowa web `*.run.app` only.
- Cloud SQL: `us-central1`, **Enterprise** (not Plus), `db-f1-micro`, zonal, 10 GiB **HDD**, **no** storage auto-increase, **one** daily backup, **no** PITR, **no** HA, **no** VPC connector. Connector unix socket. No `0.0.0.0/0` authorized networks. Deletion protection on (no cost). Create with gcloud so the Console does not pick Plus.
- Cloud Run (web + API): min instances **0**, max **1**, 256 MiB, CPU throttling, no CPU boost.
- Local `npm run dev:api` stays `AUTH_ALLOW_FAKE=1` + memory unless `DATABASE_URL` is set.

## Acceptance scenarios

### Scenario: Local and e2e stay memory + fake Google

- **Given** `DATABASE_URL` is unset and `VITE_FAKE_GOOGLE=1`
- **When** the API starts and Settings → Cloud Sync renders
- **Then** the store is in-memory
- **And** Sign in with Google is shown (fake token path)

### Scenario: Production Sign in needs API URL and client id

- **Given** a web build with `VITE_API_URL` set and no fake Google
- **When** `VITE_GOOGLE_CLIENT_ID` is empty
- **Then** `cloudConfigured()` is false
- **And** Settings shows that cloud sign-in is not configured
- **When** `VITE_GOOGLE_CLIENT_ID` is also set
- **Then** `cloudConfigured()` is true

### Scenario: Postgres CAS matches memory

- **Given** a Postgres-backed store (or a pool that speaks the same SQL)
- **When** a client PUTs an entity with a stale `rev`
- **Then** the store reports conflict (API 409)
- **And** a matching `rev` with `deleted=true` stores a gravestone
- **And** wrap updates use `wrapRev` CAS the same way

### Scenario: Schema on connect

- **Given** `DATABASE_URL` points at Postgres
- **When** the API process starts
- **Then** it applies `schema.sql` (`CREATE TABLE IF NOT EXISTS`) before serving
- **And** a restart keeps users, sessions, and entities

### Scenario: Production API env

- **Given** GitHub vars `GOOGLE_CLIENT_ID` and `CLOUD_SQL_INSTANCE` are set and Secret Manager `database-url` exists
- **When** `deploy-api` runs
- **Then** Cloud Run gets `WEB_ORIGIN` of the web service, `GOOGLE_CLIENT_ID`, Cloud SQL attach, and `DATABASE_URL` from that secret
- **And** `AUTH_ALLOW_FAKE` is not set

## Traceability

- Vitest: `apps/api/src/postgres-store.test.js` — CAS / gravestone / wrapRev; `apps/api/src/store.test.js` — memory when `DATABASE_URL` unset; `apps/web/src/lib/application/cloud-api.test.ts` — `cloudConfigured()`
- Playwright: none (e2e stays fake Google)
- Implementation: `apps/api/src/postgres-store.js`, `apps/api/src/store.js`, `apps/api/src/index.js`, `apps/api/src/app.js` (await store), `Dockerfile.web`, `cloudbuild.web.yaml`, `.github/workflows/deploy-web.yml`, `.github/workflows/deploy-api.yml`, `docs/HOSTING.md`

## Related

- 118 Cloud Run deploy
- 119 Google session + GIS
- 121 sync protocol (unchanged)
