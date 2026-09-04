# Tasks 178: Production Cloud SQL + Google Sign-In

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] Branch `feat/178-production-cloud-sql-google` off `main`
- [x] TDD: `apps/api/src/postgres-store.test.js` — CAS, gravestone, wrapRev against a fake pool
- [x] TDD: `apps/api/src/store.test.js` — memory when `DATABASE_URL` unset
- [x] Postgres store + schema-on-connect; `pg`; `index.js` / `app.js` await store
- [x] TDD: `apps/web/src/lib/application/cloud-api.test.ts` — `cloudConfigured()`
- [x] Tighten `cloudConfigured()`; bake `VITE_API_URL` + `VITE_GOOGLE_CLIENT_ID` in `Dockerfile.web` / `cloudbuild.web.yaml` / `deploy-web.yml`
- [x] `deploy-api.yml`: `WEB_ORIGIN`, `GOOGLE_CLIENT_ID`, Cloud SQL attach, Secret Manager `DATABASE_URL`; never `AUTH_ALLOW_FAKE`
- [x] HOSTING.md ops checklist (OAuth Testing, Cloud SQL, secrets, IAM, GitHub vars)
- [x] AGENTS.md / ARCHITECTURE / specs README
- [x] `npm run check` + `npm run test:unit:run` (api + web `cloud-api` / api store)
- [x] Commit linking Spec 178
