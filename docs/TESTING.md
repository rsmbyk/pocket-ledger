# Testing

## Commands

```bash
npm run test:unit:run   # Vitest
npx playwright install chromium
npm run test:e2e        # Playwright against production build preview
npm test                # unit then e2e
```

## Layers

1. **Unit (Vitest)** — `*.test.ts` next to domain/shared modules
2. **Acceptance (Playwright)** — `e2e/*.e2e.ts` mapped to specs
3. **Typecheck** — `npm run check`

## CI

GitHub Actions (Spec 116) runs `npm run check`, `npm run test:unit:run`, and `npm run test:e2e` on pull requests and on push to `main`. That workflow does **not** deploy.

## Rules

- New money/domain behavior: Vitest first (TDD)
- New user-visible flow: update spec + Playwright
- Do not skip failing acceptance by deleting the test — defer in the spec’s out-of-scope instead
