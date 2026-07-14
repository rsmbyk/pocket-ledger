# Hosting

## Primary: Cloudflare Workers + static assets (Git-connected)

| Item | Value |
|------|--------|
| Production URL | https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Source | GitHub `rsmbyk/pocket-ledger` → `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Assets | `wrangler.toml` → `[assets] directory = "./dist"` |
| App `base` | `/` (site root) |

Cloudflare builds on push — **GitHub Actions is not required** for deploys.

`pages_build_output_dir` must **not** be set. That flag makes Wrangler treat the project as classic Pages and reject `wrangler deploy` (which is what the Git pipeline runs).

SPA deep links use `not_found_handling = "single-page-application"` in `wrangler.toml` (not `public/_redirects`).

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
```

Token needs **Workers Scripts Edit** (and account access). Never commit tokens. Rotate if a token was shared in chat.

## Former: GitHub Pages / classic Cloudflare Pages

Deprecated for this project. GitHub Actions billing blocked GH Pages; the live hostname is `*.workers.dev` via Workers static assets, not a separate Pages project.

## Origin / IndexedDB

Ledger data is stored per browser origin. Changing the public URL (e.g. custom domain later) starts an empty database unless the user restores an export.
