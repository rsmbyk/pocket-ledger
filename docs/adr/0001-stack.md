# ADR 0001: Svelte 5 + Vite + shadcn-svelte

## Status

Accepted

## Context

Need a static, installable web app with a solid component kit and Svelte 5 runes.

## Decision

- Svelte 5 + Vite SPA (not SvelteKit) for simple static hosting
- shadcn-svelte (Vega style, Lucide) + Tailwind CSS v4
- mode-watcher for class-based dark mode

## Consequences

- No SSR; perfect for Pages
- shadcn CLI works with `$lib` aliases
- Bundle and PWA caching stay straightforward
