# Contributing

## Workflow

1. Read `docs/PROCESS.md` and the relevant spec (or add one).
2. Branch from `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
3. TDD domain/application changes; keep Playwright scenarios green.
4. Open a PR using the template. Link the spec.
5. Wait for CI; merge to `main` (Pages deploys automatically).

## Local checks

```bash
npm run check
npm run test:unit:run
npm run test:e2e
npm run lint
```

## Commit messages

Conventional Commits. Keep subjects imperative and short.
