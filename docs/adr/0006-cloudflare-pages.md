# ADR 0006: Cloudflare Pages (Git-connected)

## Status

Accepted

## Context

GitHub Actions deploys were blocked (account billing lock). We still need free static hosting for the Vite PWA with Git-based continuous deploy.

## Decision

- Host on **Cloudflare Pages** connected to the GitHub repo
- Serve at site root (`base: '/'`)
- Keep code on GitHub; Cloudflare runs the build
- Remove the GitHub Pages deploy workflow
- Optional Wrangler CLI for manual deploys; not required for day-to-day

Production URL at acceptance: https://pocket-ledger.ronaldsumbayak611.workers.dev/

## Consequences

- Deploys no longer depend on GitHub Actions minutes
- New origin vs `*.github.io` ⇒ empty IndexedDB (expected)
- CI workflow may still fail while GH billing is locked; that does not block Cloudflare deploys
