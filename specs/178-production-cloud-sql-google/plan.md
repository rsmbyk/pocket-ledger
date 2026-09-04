# Plan 178: Production Cloud SQL + Google Sign-In

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 118 deploy, 119 Google session, 121 sync protocol

## Why

Signed-in sync already works locally with fake Google and an in-memory API. Production still shows “Cloud sign-in is not configured on this build” (web image never bakes `VITE_API_URL` / `VITE_GOOGLE_CLIENT_ID`), and a Cloud Run restart drops signed-in rows. Turn on real GIS and durable Cloud SQL in the same slice so the Sign in button never appears without persistence.

## Approach

Postgres store matching the memory store (CAS, gravestones, wrap coat-check). `DATABASE_URL` → Postgres + schema-on-connect; unset → memory (local / CI / e2e). Bake web env at image build. API Cloud Run: `WEB_ORIGIN`, `GOOGLE_CLIENT_ID`, Cloud SQL attach, Secret Manager `DATABASE_URL`. Never `AUTH_ALLOW_FAKE` in prod.

## Scope / edges

**In:** Postgres store + `pg`, bake Vite env, Cloud Run env/secrets wiring, tighten `cloudConfigured()`, cheapest Cloud SQL + Cloud Run ops in HOSTING (Enterprise f1-micro, HDD, no PITR/HA/VPC, Run max 1).

**Out:** Custom domain, VPC / private IP, Terraform, local Docker Postgres, wipe-account, Cloud lockout, GIS prompt UX, Android.
