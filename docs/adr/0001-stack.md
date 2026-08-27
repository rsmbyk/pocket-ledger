# ADR 0001: Svelte 5 + Vite + shadcn-svelte

## Status

Accepted

## Context

Need a static, installable web app with a solid component kit and Svelte 5 runes.

## Decision

- Svelte 5 + SvelteKit `adapter-static` with path URLs (Spec 117); no SSR
- shadcn-svelte (Vega style, Lucide) + Tailwind CSS v4
- mode-watcher for class-based dark mode

## Consequences

- No SSR; static assets on Cloud Run (Spec 118)
- shadcn CLI works with `$lib` aliases
- Bundle and PWA caching stay straightforward; hash bookmarks are not preserved
