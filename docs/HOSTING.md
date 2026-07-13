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

```bash
npm run build
npx wrangler pages deploy dist --project-name=pocket-ledger --branch main
```

Requires `wrangler login` or `CLOUDFLARE_API_TOKEN` (never commit tokens).

## Former: GitHub Pages

Deprecated for this project (account Actions billing blocked deploys). Workflow removed. Optional `GITHUB_PAGES` path builds are gone — always ship at `/`.

## Origin / IndexedDB

Ledger data is stored per browser origin. Changing the public URL (e.g. custom domain later) starts an empty database unless the user restores an export.
