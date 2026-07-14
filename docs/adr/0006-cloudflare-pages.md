# ADR 0006: Cloudflare Workers static assets (Git-connected)

## Status

Accepted (updated 2026-07-14)

## Context

GitHub Actions deploys were blocked (account billing lock). We still need free static hosting for the Vite PWA with Git-based continuous deploy. The first cut used `pages_build_output_dir` while the Git pipeline ran `npx wrangler deploy`, which fails because that flag marks the project as classic Pages.

## Decision

- Host on **Cloudflare Workers** with **static assets** from `./dist`
- Git pipeline: `npm run build` then `npx wrangler deploy`
- Serve at site root (`base: '/'`)
- SPA fallback via `not_found_handling = "single-page-application"`
- Keep code on GitHub; Cloudflare runs the build
- Do not use `pages_build_output_dir` or `wrangler pages deploy` for this project

Production URL at acceptance: https://pocket-ledger.ronaldsumbayak611.workers.dev/

## Consequences

- Deploys no longer depend on GitHub Actions minutes
- Hostname is `*.workers.dev` (Workers), not `*.pages.dev`
- New origin vs `*.github.io` ⇒ empty IndexedDB (expected)
- CI workflow may still fail while GH billing is locked; that does not block Cloudflare deploys
