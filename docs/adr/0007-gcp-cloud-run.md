# ADR 0007: GCP Cloud Run (web + API)

## Status

Accepted

## Context

Signed-in mode needs a Google identity, an API, and Postgres ciphertext. Local-only users must keep a static PWA. Cloudflare Workers was enough for a client-only app. Fly.io was considered; GCP wins because Google Sign-In and Play later share one vendor. Same-origin cookies were considered; two Cloud Run services means two origins.

## Decision

- Leave Cloudflare as the production target.
- Host **two Cloud Run** services: static web (`adapter-static`) and Hono API.
- Default `*.run.app` hostnames are OK; custom domain is parked.
- Session cookie on the **API** host; CORS from the web origin.
- Deploy with GitHub Actions + Workload Identity Federation, **path-filtered** so a web change does not roll the API service (and vice versa).
- npm workspaces: `apps/web` + `apps/api`. `openapi.yaml` in this repo.
- Android is a **second GitHub repo**, not a third service in this monorepo.
- Cutover is a new origin: IndexedDB does not migrate from Cloudflare.

Rejected: Firebase Auth/Firestore as the ledger, Clerk, adapter-node as the web host, Cloud Build as the primary pipeline, a separate `pocket-ledger-api` GitHub repo.

## Consequences

- Web can stay a PWA (offline after first load) while the API is online-only for signed-in money.
- Operators must configure GCP + WIF; deploys depend on GitHub Actions (Spec 116 restores CI; Spec 118 adds deploy).
- Two origins: cookie and CORS must be explicit.
