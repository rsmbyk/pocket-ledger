# Hosting

## Target: GCP Cloud Run (two services)

| Item    | Value                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project  | `pocket-ledger-rsmbyk`                                                                                                                                                                   |
| Region   | **us-central1** (Iowa). Cloud Run always-free allowance applies here; Jakarta (`asia-southeast2`) does not.                                                                              |
| Web      | Cloud Run serving **static** SvelteKit assets (`Dockerfile.web`)                                                                                                                         |
| API      | Cloud Run running Hono (`Dockerfile.api`)                                                                                                                                                |
| URLs     | Web: https://pocket-ledger-web-w6fanfnuqa-uc.a.run.app — API: https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app (confirm after first Iowa deploy). Custom domain is **parked**. Jakarta `-et` URLs are retired after cutover. |
| Origins  | **Two origins** + CORS. Session cookie lives on the **API** host (not same-origin cookies).                                                                                              |
| Deploy   | GitHub Actions + Workload Identity Federation. **Path-filtered:** `apps/web/**` does not deploy API; `apps/api/**` does not deploy web.                                                  |
| Images   | Artifact Registry `cloud-run-source-deploy` in `us-central1`; Cloud Build uses `cloudbuild.web.yaml` / `cloudbuild.api.yaml` because `gcloud run deploy` has no `--dockerfile` flag.     |
| Blobs    | Postgres `bytea` until size hurts (GCS parked). Schema: `apps/api/schema.sql`, applied on API boot. Local/dev/CI uses in-memory unless `DATABASE_URL` is set.                            |
| Database | Cloud SQL Postgres (Spec 178): Enterprise `db-f1-micro`, zonal, 10 GiB HDD, one backup, no PITR/HA/VPC. |

Cutover to Cloud Run is a **new origin** = **empty IndexedDB**. Data on the Cloudflare origin does not move. Users who need local history should export an encrypted backup (Spec 120) before switching hosts.

**Production deploy path is GitHub Actions → Cloud Run** (Spec 118). Repo variables `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`, and `GCP_REGION` (`us-central1`) are set. If `GCP_PROJECT_ID` is missing, the deploy workflows still skip Cloud Run so PRs can CI. Google’s frontend reserves `/healthz`, so probe `/v1/me` (401 when signed out) instead.

Production signed-in (Spec 178): bake `VITE_API_URL` (defaults to the API `*.run.app` URL) and `VITE_GOOGLE_CLIENT_ID` into the web image. The API uses Cloud SQL when GitHub var `CLOUD_SQL_INSTANCE` is set and Secret Manager `database-url` is bound. **Spec 181 temporary:** Cloud Run sets `AUTH_ALLOW_FAKE=1` and `AUTH_FAKE_SUB=pl-debug-cursor` so Settings can **Sign up with fake account** without GIS (Cursor’s browser cannot finish the Google popup). Remove with specs 180–181. Until `GOOGLE_CLIENT_ID` is set, Settings shows “Cloud sign-in is not configured on this build.” Set `GOOGLE_CLIENT_ID` and `CLOUD_SQL_INSTANCE` together so Sign in never appears without persistence.

## Cookie and CORS

- Session cookie: **7-day rolling**, HttpOnly, Secure, on the API host. Production uses SameSite=None (`COOKIE_SECURE` default).
- Web origin is allowlisted on the API for credentialed CORS (`WEB_ORIGIN`).
- Do not put the session cookie on the web host.
- API env: `GOOGLE_CLIENT_ID` (GIS audience), `AUTH_ALLOW_FAKE=1` for local/e2e (`fake.<sub>.<email>` tokens) and **temporarily** on Cloud Run with `AUTH_FAKE_SUB=pl-debug-cursor` (Spec 181). `COOKIE_SECURE=0` on http://127.0.0.1, `WEB_ORIGIN`, `DATABASE_URL` (production).

Web build env: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`. `VITE_FAKE_GOOGLE=1` for e2e only — never bake fake Google into the Cloud Run web image.

## GitHub Actions

- **CI** (Spec 116): lint/typecheck, Vitest, Playwright on `pull_request` and `push` to `main`. CI does **not** deploy.
- **Deploy** (Spec 118): path-filtered jobs to Cloud Run. Web-only changes must not roll the API service, and vice versa.

Repo variables (not secrets): `GCP_PROJECT_ID` = `pocket-ledger-rsmbyk`, `GCP_REGION` = `us-central1`, `GCP_DEPLOY_SA` = `pocket-ledger-deploy@pocket-ledger-rsmbyk.iam.gserviceaccount.com`, `GCP_WIF_PROVIDER` = `projects/513150170654/locations/global/workloadIdentityPools/github/providers/github`. The WIF provider only admits OIDC tokens from `rsmbyk/pocket-ledger`. **Change `GCP_REGION` from `asia-southeast2` to `us-central1` in the GitHub repo variables** or deploys keep landing in Jakarta.

Optional / Spec 178 (set after the ops checklist below):

- `WEB_ORIGIN` — defaults to `https://pocket-ledger-web-w6fanfnuqa-uc.a.run.app`
- `VITE_API_URL` — defaults to `https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app` (no trailing slash)
- `GOOGLE_CLIENT_ID` — GIS Web client id (public; baked into the web image and set on the API)
- `CLOUD_SQL_INSTANCE` — `pocket-ledger-rsmbyk:us-central1:pocket-ledger`

GCP Secret Manager (not a GitHub secret): `database-url` → Cloud Run `DATABASE_URL`.

## One-shot GCP ops (Spec 178)

Do these in project `pocket-ledger-rsmbyk` / region `us-central1`. Then set the GitHub vars (`GCP_REGION=us-central1` included) and redeploy **both** services (`workflow_dispatch` on `deploy-api` and `deploy-web` is enough). Keep OAuth consent in **Testing**; do not start Google verification.

A new Cloud Run region is a **new origin** = empty IndexedDB on the Iowa URL. After Iowa is healthy, delete the Jakarta Cloud Run services (`pocket-ledger-web` / `pocket-ledger-api` in `asia-southeast2`) so you do not pay for both. First Iowa image push may need Artifact Registry `cloud-run-source-deploy` in `us-central1` (Cloud Build often creates it).

### 1. APIs

```bash
gcloud config set project pocket-ledger-rsmbyk
gcloud services enable sqladmin.googleapis.com secretmanager.googleapis.com
```

### 2. Cloud SQL (cheapest durable shape)

Create with **gcloud**, not the Console wizard. The wizard defaults to **Enterprise Plus**, PITR, and storage auto-increase — those reject `db-f1-micro` or grow the bill.

Stay on **Enterprise** (shared-core exists only there), **zonal** (no HA), **10 GiB HDD**, **no auto-increase**, **one daily backup**, **no PITR**, **no VPC connector** (Serverless VPC Access is another always-on charge). Public IP is for the Cloud SQL connector only — do **not** add `0.0.0.0/0` authorized networks. Deletion protection does not cost extra.

```bash
gcloud sql instances create pocket-ledger \
  --database-version=POSTGRES_16 \
  --edition=ENTERPRISE \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=zonal \
  --storage-size=10 \
  --storage-type=HDD \
  --no-storage-auto-increase \
  --backup-start-time=17:00 \
  --retained-backups-count=1 \
  --deletion-protection
```

If `--storage-type=HDD` is rejected, drop that flag (SSD, still 10 GiB, still `--no-storage-auto-increase`). If `--tier=db-f1-micro` is rejected, you picked Plus by mistake — recreate with `--edition=ENTERPRISE`. Do not “upgrade” to `db-g1-small` unless f1-micro is gone from the region.

Do **not** enable point-in-time recovery, query insights, or a private IP / VPC connector. One backup of a tiny ciphertext ledger is pennies; WAL/PITR is how backup cost quietly grows.

```bash
gcloud sql databases create pocket_ledger --instance=pocket-ledger
gcloud sql users create pl --instance=pocket-ledger --password='YOUR_PASSWORD'
```

Connection name: `pocket-ledger-rsmbyk:us-central1:pocket-ledger`. Unix socket on Cloud Run: `/cloudsql/pocket-ledger-rsmbyk:us-central1:pocket-ledger`.

### 3. Secret Manager

Replace `PASSWORD` with the `pl` user password. No host in the URL — the socket is `host=/cloudsql/...`.

```bash
echo -n 'postgresql://pl:PASSWORD@/pocket_ledger?host=/cloudsql/pocket-ledger-rsmbyk:us-central1:pocket-ledger' \
  | gcloud secrets create database-url --data-file=-
```

Use a dedicated Cloud Run runtime SA (`pocket-ledger-run`). Secret Manager rejects IAM bindings on the default Compute Engine SA in this project (`…-compute@developer.gserviceaccount.com` “does not exist” even though Cloud Run can still run as it). Project number is `513150170654`. The GitHub deploy SA must be allowed to act as the runtime SA (`roles/iam.serviceAccountUser`).

```bash
RUNTIME_SA="pocket-ledger-run@pocket-ledger-rsmbyk.iam.gserviceaccount.com"
DEPLOY_SA="pocket-ledger-deploy@pocket-ledger-rsmbyk.iam.gserviceaccount.com"

gcloud iam service-accounts create pocket-ledger-run \
  --display-name="Pocket Ledger Cloud Run runtime"

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role=roles/secretmanager.secretAccessor

gcloud projects add-iam-policy-binding pocket-ledger-rsmbyk \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role=roles/cloudsql.client

gcloud projects add-iam-policy-binding pocket-ledger-rsmbyk \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role=roles/logging.logWriter

gcloud iam service-accounts add-iam-policy-binding "${RUNTIME_SA}" \
  --member="serviceAccount:${DEPLOY_SA}" \
  --role=roles/iam.serviceAccountUser
```

### 4. Google Identity Services

In APIs & Services → OAuth consent screen:

- User type **External**, publishing status **Testing**
- App name Pocket Ledger; add your Gmail as a test user
- Scopes: `openid`, `email`, `profile` (GIS default)

Credentials → Create credentials → **OAuth client ID** → application type **Web application**:

- Authorized JavaScript origins: `https://pocket-ledger-web-w6fanfnuqa-uc.a.run.app` only (the Iowa web URL; add it after the first web deploy if the hash differs)
- Redirect URIs: not required for the GIS **Sign in with Google** button (`renderButton`, `ux_mode: popup`). Do **not** use One Tap `google.accounts.id.prompt()` — FedCM One Tap often fails silently on Cloud Run.

Copy the client id into GitHub repo variable `GOOGLE_CLIENT_ID`.

### 5. GitHub vars + deploy

Set `GOOGLE_CLIENT_ID` and `CLOUD_SQL_INSTANCE=pocket-ledger-rsmbyk:us-central1:pocket-ledger` together. Optionally set `WEB_ORIGIN` / `VITE_API_URL` if the `*.run.app` hash is not `w6fanfnuqa-uc`. Then run **Deploy API** and **Deploy web**.

The API applies `apps/api/schema.sql` on boot. Probe `GET https://pocket-ledger-api-w6fanfnuqa-uc.a.run.app/v1/me` (401 signed out). On the web origin, Settings → Cloud Sync should show **Sign in with Google** (not the “not configured” copy).

Deploys pin Cloud Run to **min 0 / max 1** instance, **256 MiB**, CPU throttling, no CPU boost. Do not set min instances in the Console. `us-central1` is the locked region so personal traffic can stay inside Cloud Run’s always-free allowance.

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

## Former hosts

Cloudflare Workers and GitHub Pages were interim hosts before Cloud Run. Those origins do not share IndexedDB with `*.run.app`. GitHub Pages for this repo is disabled.
