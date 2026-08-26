# Tasks 120: Always-on local DEK wrapping; encrypted local-only backup

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted by Ronald
- [ ] TDD: wrap/unwrap, raw vs wrapped DEK, re-wrap without touching rows
- [ ] TDD: one-time plaintext migrate
- [ ] TDD: encrypted envelope export/import; reject formatVersion 1
- [ ] TDD: one-time export passphrase does not enable device lock
- [ ] Application + Dexie: encrypt on write, decrypt per read
- [ ] Hide backup while signed in (depends 119 or feature-flag until then)
- [ ] Playwright backup + migrate on existing fixture
- [ ] `specs/README.md` 120 Accepted when landing
- [ ] Commit + draft PR linking Spec 120
