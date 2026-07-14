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

## Encryption

Optional passphrase lock (`encryption.enabled`, default off) derives an in-memory AES-GCM key. Sensitive strings (notes, goal names, category names) are sealed in IndexedDB as `enc:v1:…` while amounts/dates/ids stay plaintext for ledger math. Export while unlocked emits plaintext JSON.

## Routing

Hash router in `src/lib/shared/router.ts` (no router package). Shell tabs sync with `#/`, `#/activity`, `#/categories`, `#/more`. Unknown hashes fall back to home. Path-based history routing is out of scope until needed.

## Testing map

| Layer | Tool |
|-------|------|
| domain / shared | Vitest (node) |
| application (later with fakes) | Vitest |
| acceptance | Playwright against built preview |
