# Hosting

## Target: GCP Cloud Run (two services)

| Item | Value |
|------|--------|
| Web | Cloud Run serving **static** SvelteKit assets (`Dockerfile.web`) |
| API | Cloud Run running Hono (`Dockerfile.api`) |
| URLs | Default `*.run.app` is OK. Custom domain is **parked**. |
| Origins | **Two origins** + CORS. Session cookie lives on the **API** host (not same-origin cookies). |
| Deploy | GitHub Actions + Workload Identity Federation. **Path-filtered:** `apps/web/**` does not deploy API; `apps/api/**` does not deploy web. |
| Blobs | Postgres `bytea` until size hurts (GCS parked) |

Cutover to Cloud Run is a **new origin** = **empty IndexedDB**. Data on the Cloudflare origin does not move. Users who need local history should export an encrypted backup (Spec 120) before switching hosts.

Spec 118 is the slice that makes this true in production. Until it lands, the live site may still be Cloudflare (below).

## Cookie and CORS

- Session cookie: **7-day rolling**, HttpOnly, Secure, on the API host.
- Web origin is allowlisted on the API for credentialed CORS.
- Do not put the session cookie on the web host.

## GitHub Actions

- **CI** (Spec 116): lint/typecheck, Vitest, Playwright on `pull_request` and `push` to `main`. CI does **not** deploy.
- **Deploy** (Spec 118): path-filtered jobs to Cloud Run. Web-only changes must not roll the API service, and vice versa.

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

**Not the target.** Kept here until Spec 118 retires it as production.

| Item | Value |
|------|--------|
| Production URL (until cutover) | https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Source | GitHub `rsmbyk/pocket-ledger` → `main` |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Assets | `wrangler.toml` → `[assets] directory = "./dist"` |
| App `base` | `/` (site root) |

Cloudflare Git integration still deploys `main` until 118 cuts over. After 118: do not use Wrangler as the production path.

`pages_build_output_dir` must **not** be set. SPA deep links used `not_found_handling = "single-page-application"`. GitHub Deployments reporting used `npm run report:github-deployment` with `GITHUB_DEPLOYMENTS_TOKEN`.

### Local Wrangler (until retired)

Credentials live in **`.env.local`** (gitignored). Template: `.env.example`. Token needs **Workers Scripts Edit**. Never commit tokens.

## Former: GitHub Pages / classic Cloudflare Pages

Deprecated. GitHub Actions billing once blocked GH Pages; the interim hostname was `*.workers.dev`.
