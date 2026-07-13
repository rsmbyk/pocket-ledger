# Hosting

## Primary: Cloudflare Pages (Git-connected)

| Item | Value |
|------|--------|
| Production URL | https://pocket-ledger.ronaldsumbayak611.workers.dev/ |
| Source | GitHub `rsmbyk/pocket-ledger` → `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| App `base` | `/` (site root) |

Cloudflare builds on push — **GitHub Actions is not required** for deploys.

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
npx wrangler pages deploy dist --project-name=pocket-ledger --branch main
```

Never commit tokens. Rotate the token in the Cloudflare dashboard if it was ever shared in chat or committed by mistake.

## Former: GitHub Pages

Deprecated for this project (account Actions billing blocked deploys). Workflow removed. Optional `GITHUB_PAGES` path builds are gone — always ship at `/`.

## Origin / IndexedDB

Ledger data is stored per browser origin. Changing the public URL (e.g. custom domain later) starts an empty database unless the user restores an export.
