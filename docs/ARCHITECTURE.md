# Architecture

Client-only app. GitHub Pages serves static files; all business behavior runs in the browser.

## Layers

```text
src/lib/ui            → presentation (Svelte + shadcn)
src/lib/application   → use cases / orchestration
src/lib/domain        → pure types & money rules
src/lib/data          → Dexie, repos, migrations
src/lib/shared        → cross-cutting helpers (theme, etc.)
```

### Dependency rule

- `ui` may call `application` and read `domain` types
- `application` may call `data` and `domain`
- `domain` depends on nothing (no Dexie, no Svelte)
- `data` implements persistence for domain shapes

UI components must not import Dexie directly.

## Money

All amounts are **integer minor units**. No floating-point ledger math.

## Double-entry readiness

Simple ledger rows include:

- `accountId`
- `type`: `income` | `expense` | `transfer`
- `counterAccountId` (nullable; for future transfers)

Do not invent a second parallel storage model when transfers arrive — extend this shape.

## Encryption (later)

Optional encryption is a `data`-layer adapter concern. Use cases stay the same; settings key `encryption.enabled` is reserved (default off).

## Routing

No router in scaffold. Add a SPA router when deep links, back-stack pain, or Playwright URL stability require it. Prefer hash routing or a configured Pages `base` if path routing is introduced.

## Testing map

| Layer | Tool |
|-------|------|
| domain / shared | Vitest (node) |
| application (later with fakes) | Vitest |
| acceptance | Playwright against built preview |
