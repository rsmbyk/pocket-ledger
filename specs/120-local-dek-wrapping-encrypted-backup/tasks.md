# Tasks 120: Always-on local DEK wrapping; encrypted local-only backup

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted by Ronald
- [x] TDD: wrap/unwrap, raw vs wrapped DEK, re-wrap without touching rows
- [x] TDD: one-time plaintext migrate
- [x] TDD: encrypted envelope export/import; reject formatVersion 1
- [x] TDD: one-time export passphrase does not enable device lock
- [x] Application + Dexie: encrypt on write, decrypt per read
- [x] Hide backup while signed in (depends 119 or feature-flag until then)
- [x] Playwright backup + migrate on existing fixture
- [x] `specs/README.md` 120 Accepted when landing
- [ ] Commit + draft PR linking Spec 120
