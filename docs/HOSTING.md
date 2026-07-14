# Hosting

## Primary: Cloudflare Workers + static assets (Git-connected)

| Item | Value |
|------|--------|
| Production URL | https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Source | GitHub `rsmbyk/pocket-ledger` → `main` |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Assets | `wrangler.toml` → `[assets] directory = "./dist"` |
| App `base` | `/` (site root) |

Cloudflare builds on push — **GitHub Actions is not required** for deploys.

`pages_build_output_dir` must **not** be set. That flag makes Wrangler treat the project as classic Pages and reject `wrangler deploy` (which is what the Git pipeline runs).

SPA deep links use `not_found_handling = "single-page-application"` in `wrangler.toml`. Do **not** ship a `public/_redirects` SPA rule — Workers rejects it as an infinite loop when assets are uploaded.

### GitHub Deployments (repo sidebar)

Workers Builds already posts **check runs** on commits. The Environments / Deployments panel on the right of the GitHub repo is a separate API — Cloudflare does not fill it for Workers automatically.

We report it after a successful Wrangler deploy via `npm run report:github-deployment`.

**One-time Cloudflare dashboard setup** (Worker → Settings → Builds):

1. Set **Deploy command** to:
   `npm run deploy`
2. Under **Build variables and secrets**, add secret `GITHUB_DEPLOYMENTS_TOKEN`:
   - Fine-grained PAT on `rsmbyk/pocket-ledger` with **Deployments: Read and write** (Contents read is enough beside that), **or**
   - Classic PAT with `repo` scope (broader — prefer fine-grained)
3. Push to `main` (or re-run a build). The repo sidebar should show **production** → live URL.

Without the token the deploy still succeeds; reporting is skipped.

### Local / CLI (optional)

Credentials live in **`.env.local`** (gitignored). Template: `.env.example`.

```powershell
# PowerShell: load then deploy
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_.Split('=', 2)
  Set-Item -Path "Env:$k" -Value $v
}
npm run build
npx wrangler deploy
npm run report:github-deployment
```

Token needs **Workers Scripts Edit** (and account access). For GitHub reporting, also set `GITHUB_DEPLOYMENTS_TOKEN`. Never commit tokens. Rotate if a token was shared in chat.

## Former: GitHub Pages / classic Cloudflare Pages

Deprecated for this project. GitHub Actions billing blocked GH Pages; the live hostname is `*.workers.dev` via Workers static assets, not a separate Pages project.

## Origin / IndexedDB

Ledger data is stored per browser origin. Changing the public URL (e.g. custom domain later) starts an empty database unless the user restores an export.
