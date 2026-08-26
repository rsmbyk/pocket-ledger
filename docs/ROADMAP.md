# Roadmap

Ordered slices. Each slice gets a numbered spec before code.

## Local-first + optional cloud (current wave)

1. ~~**Docs unlock** — two modes, GCP, decided/dropped/parked, architecture, flows~~ → `specs/115-docs-unlock-local-first-cloud/`
2. **GitHub Actions CI** — check, unit, e2e; no deploy → `specs/116-github-actions-ci/`
3. ~~**SvelteKit path URLs + PWA** — replace hash router; keep SW~~ → `specs/117-sveltekit-path-urls-pwa/`
4. **Cloud Run web** — path-filtered Actions; retire Cloudflare production → `specs/118-gcp-cloud-run-web/`
5. **Google Sign-In + account lock** — mandatory passphrase, hex kit, resumable onboarding, session manager → `specs/119-google-sign-in-account-lock/`
6. **Local DEK wrapping + encrypted backup** — always-on DEK; signed-out export/import only → `specs/120-local-dek-wrapping-encrypted-backup/`
7. **Signed-in sync** — `rev`, 409 close+refresh, gravestones, 30s poll, settings → `specs/121-signed-in-sync/`
8. **Android** — parked; second GitHub repo `pocket-ledger-android`, not this tree → `specs/122-android-second-repo-parked/`

Parked after this wave (not v1): cloud lockout + email, wipe/delete account, Argon2id, custom domain, GCS. See `docs/PRODUCT.md`.

## Shipped (historical)

1. ~~**Transactions** — add/list expenses & income (mobile quick-add sheet)~~ → `specs/001-transactions.md`
2. ~~**Categories** — seed + assign~~ (included in 001; custom category UI still later)
3. ~~**Month summary + charts** — cashflow / category views~~ → `specs/002-month-charts.md`
4. ~~**Export** — JSON backup download~~ → `specs/003-export-import.md` (plaintext; Spec 120 replaces with encrypted envelope)
5. ~~**Recurring** — templates that spawn transactions~~ → removed in `specs/087-remove-recurring/` (was `004`)
6. ~~**Goals** — progress toward targets~~ → `specs/005-goals.md`
7. ~~**Net worth** — account snapshots over time~~ → removed in `specs/059-remove-net-worth/` (was `006`)
8. ~~**Optional encryption / passphrase lock** — off by default~~ → `specs/007-passphrase-lock.md` (Spec 120: always-on DEK + optional wrap)
9. ~~**Import** — restore from export~~ → `specs/003-export-import.md`
10. ~~**Router** — hash routes for shell panels~~ → `specs/009-router.md` (Spec 117: path URLs)
11. ~~**Custom category management** — add/rename beyond seeds~~ → `specs/010-custom-categories.md`
12. ~~**Field-level at-rest encryption** — deepen beyond passphrase gate~~ → `specs/011-field-encryption.md`
13. ~~**Polish** — edit/delete transactions, empty CTAs, safe-area mobile tweaks~~ → `specs/012-polish.md`
14. ~~**Desktop-first shell** — persistent rail, wide stage, responsive drawer on mobile~~ → `specs/013-desktop-layout.md`
15. ~~**Void transactions** — irreversible void instead of hard delete~~ → `specs/014-void-transactions.md`
16. ~~**Destructive confirms** — danger buttons + warns~~ → `specs/015-destructive-confirms.md`
17. ~~**Activity without balance strip**~~ → `specs/016-activity-balance.md`
18. ~~**Activity filters + search**~~ → `specs/017-activity-filters.md`
19. ~~**Categories add modal**~~ → `specs/018-categories-add-modal.md`
20. ~~**Drawer trigger morph**~~ → `specs/019-drawer-trigger-morph.md`

Later UI slices 020–114: see `specs/README.md`.
