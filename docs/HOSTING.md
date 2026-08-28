# Hosting

## Target: GCP Cloud Run (two services)

| Item    | Value                                                                                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project | `pocket-ledger-rsmbyk`                                                                                                                                                                   |
| Region  | **asia-southeast2** (Jakarta)                                                                                                                                                            |
| Web     | Cloud Run serving **static** SvelteKit assets (`Dockerfile.web`)                                                                                                                         |
| API     | Cloud Run running Hono (`Dockerfile.api`)                                                                                                                                                |
| URLs    | Web: https://pocket-ledger-web-w6fanfnuqa-et.a.run.app — API: https://pocket-ledger-api-w6fanfnuqa-et.a.run.app. Custom domain is **parked**.                                            |
| Origins | **Two origins** + CORS. Session cookie lives on the **API** host (not same-origin cookies).                                                                                              |
| Deploy  | GitHub Actions + Workload Identity Federation. **Path-filtered:** `apps/web/**` does not deploy API; `apps/api/**` does not deploy web.                                                  |
| Images  | Artifact Registry `cloud-run-source-deploy` in `asia-southeast2`; Cloud Build uses `cloudbuild.web.yaml` / `cloudbuild.api.yaml` because `gcloud run deploy` has no `--dockerfile` flag. |
| Blobs   | Postgres `bytea` until size hurts (GCS parked). Schema: `apps/api/schema.sql`. Local/dev/CI uses an in-memory store unless `DATABASE_URL` is set later.                                  |

Cutover to Cloud Run is a **new origin** = **empty IndexedDB**. Data on the Cloudflare origin does not move. Users who need local history should export an encrypted backup (Spec 120) before switching hosts.

**Production deploy path is GitHub Actions → Cloud Run** (Spec 118). Wrangler is not used for production. Repo variables `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`, and `GCP_REGION` (`asia-southeast2`) are set. If `GCP_PROJECT_ID` is missing, the deploy workflows still skip Cloud Run so PRs can CI. The API still uses the in-memory store (no Cloud SQL yet); a Cloud Run restart drops signed-in rows. Google’s frontend reserves `/healthz`, so probe `/v1/me` (401 when signed out) instead.

## Cookie and CORS

- Session cookie: **7-day rolling**, HttpOnly, Secure, on the API host.
- Web origin is allowlisted on the API for credentialed CORS (`WEB_ORIGIN`).
- Do not put the session cookie on the web host.
- API env: `GOOGLE_CLIENT_ID` (GIS audience), `AUTH_ALLOW_FAKE=1` only for local/e2e (`fake.<sub>.<email>` tokens), `COOKIE_SECURE=0` on http://127.0.0.1, `WEB_ORIGIN`.

Web build env: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_FAKE_GOOGLE=1` for e2e.

## GitHub Actions

- **CI** (Spec 116): lint/typecheck, Vitest, Playwright on `pull_request` and `push` to `main`. CI does **not** deploy.
- **Deploy** (Spec 118): path-filtered jobs to Cloud Run. Web-only changes must not roll the API service, and vice versa.

Repo variables (not secrets): `GCP_PROJECT_ID` = `pocket-ledger-rsmbyk`, `GCP_REGION` = `asia-southeast2`, `GCP_DEPLOY_SA` = `pocket-ledger-deploy@pocket-ledger-rsmbyk.iam.gserviceaccount.com`, `GCP_WIF_PROVIDER` = `projects/513150170654/locations/global/workloadIdentityPools/github/providers/github`. The WIF provider only admits OIDC tokens from `rsmbyk/pocket-ledger`.

## Local Docker

Compose runs the web (and later API) so you do not need Node on the host.

```bash
docker compose up --build          # Vite / Kit dev → http://localhost:5173
docker compose --profile preview up preview   # built preview → :4173
```

`node_modules` lives in a named volume so the bind mount does not fight host/container installs.

On this machine you may also run a separate Nginx Proxy Manager stack under `/home/rsmbyk/projects/local-dev-proxy` to map a portless `*.localhost` name to a published host port. That proxy is machine-local and is not required for the project Compose file.

## Origin / IndexedDB

Ledger data is stored per browser origin. Changing the public URL (Cloudflare → Cloud Run, or a custom domain later) starts an empty database unless the user restores an encrypted export (signed out) or signs in (cloud copy).

## Former: Cloudflare Workers + static assets

**Retired as the production path** (Spec 118). Do not `wrangler deploy` to ship the app.

The last Cloudflare hostname was https://pocket-ledger.ronaldsumbayak611.workers.dev/ — a different origin from Cloud Run, so IndexedDB does not carry over.

## Former: GitHub Pages / classic Cloudflare Pages

Deprecated. GitHub Actions billing once blocked GH Pages; the interim hostname was `*.workers.dev`.
