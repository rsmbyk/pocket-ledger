# Spec 115: Docs unlock — local-first + optional cloud

- **ID:** 115
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Unlock living docs for two modes (signed-out local-first vs signed-in Google E2E sync), GCP hosting, and honest crypto — so later slices have a contract in the repo, not only a chat plan.

## Scope

### In scope

1. Rewrite [`docs/PRODUCT.md`](../../docs/PRODUCT.md) locked table: two modes; Google-only cloud; mandatory account passphrase; device vs account locks; encrypted local-only backup; no signed-in export/import; settings sync while signed in; session manager; resumable onboarding
2. Rewrite [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md): layers stay; Dexie still not in UI; future `apps/web` + `apps/api`; DEK wrapping; server stores ciphertext + wraps never DEK
3. Rewrite [`docs/HOSTING.md`](../../docs/HOSTING.md): GCP Cloud Run (web + API), two origins + CORS, cookie on API host, `*.run.app` OK, Cloudflare origin change = empty IDB
4. Update [`docs/ROADMAP.md`](../../docs/ROADMAP.md): next slices 116–122; Android parked
5. Update [`AGENTS.md`](../../AGENTS.md): backend allowed for signed-in; no Dexie in UI unchanged; encryption wrapping; no `src/**` until each later Draft is Accepted
6. Update [`docs/PROCESS.md`](../../docs/PROCESS.md): deploy from GitHub Actions → Cloud Run, not Cloudflare-on-main
7. ADRs: supersede 0006 (Cloudflare); add GCP two-service; add E2E wrapping (no KMS, no operator DEK)
8. PRODUCT (or ARCHITECTURE appendix): **decided / dropped / parked** lists and flow summaries matching Specs 116–122 intent (detail stays in those specs)

### Out of scope

- Any `src/**` or dependency change
- Implementing Cloud Run, Google Sign-In, wrapping, or sync
- Android repo

## Domain rules

- Signed out: IndexedDB is the only ledger; no API.
- Signed in: Google identity; account passphrase required; E2E; online for money.
- Never force Google on local-only users.
- Operator never stores passphrase, hex kit, or raw DEK.
- Docs describe **target** architecture; code remains today’s client-only app until later Accepted specs land.

## Acceptance scenarios

### Scenario: PRODUCT describes two modes

- **Given** PRODUCT.md after this slice is implemented
- **When** a reader looks at Goal and Locked
- **Then** signed-out Dexie/PWA/offline and signed-in Google + mandatory passphrase + sync are both described
- **And** hosting is GCP Cloud Run, not Cloudflare as the target
- **And** backup is encrypted and signed-out only
- **And** non-goals include email/password, wipe-cloud, delete-account, Android-in-this-repo

### Scenario: PRODUCT records dropped and parked

- **Given** PRODUCT.md (or a clearly linked docs section)
- **When** a reader checks what we will not do
- **Then** they see dropped items including Firebase-as-ledger, optional account passphrase, which-copy chooser, local recovery key, silent LWW, plaintext JSON import
- **And** parked items including cloud lockout+email, Argon2id, Android second repo, custom domain, GCS

### Scenario: ARCHITECTURE matches wrapping and layers

- **Given** ARCHITECTURE.md after this slice
- **When** a reader checks encryption and routing
- **Then** DEK wrapping is described (passphrase wraps DEK; rows use DEK)
- **And** UI still must not import Dexie
- **And** path URLs + PWA are the target; hash router is legacy until Spec 117

### Scenario: HOSTING is GCP

- **Given** HOSTING.md after this slice
- **When** a reader checks production
- **Then** two Cloud Run services, path-filtered Actions, API cookie + CORS, and empty IDB on origin change are documented
- **And** Cloudflare Workers is former/current-until-cutover, not the target

### Scenario: AGENTS permission gate unchanged in spirit

- **Given** AGENTS.md after this slice
- **When** an agent reads Before coding
- **Then** SDD still requires Accepted Draft before `src/**` for behavior slices
- **And** “no backend” is no longer a hard forever constraint; signed-in API is in scope after those specs are Accepted

## Traceability

- Vitest: none (docs)
- Playwright: none
- Implementation:
  - `docs/PRODUCT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/HOSTING.md`
  - `docs/ROADMAP.md`
  - `docs/PROCESS.md`
  - `AGENTS.md`
  - `docs/adr/0006-cloudflare-pages.md` (superseded)
  - `docs/adr/0007-gcp-cloud-run.md` (new)
  - `docs/adr/0008-e2e-dek-wrapping.md` (new)
  - `docs/adr/README.md`
  - `specs/README.md`

## Related

- 116 GitHub Actions
- 117 SvelteKit path URLs
- 118 Cloud Run web
- 119 Google Sign-In + account lock
- 120 Local DEK wrapping + encrypted backup
- 121 Signed-in sync
- 122 Android parked

---

## Appendix A — Decided (must appear in repo docs)

When Spec 115 lands, PRODUCT / ARCHITECTURE / HOSTING / ROADMAP must record these as living truth (not only the Cursor plan). Later specs (116–122) own implementation detail.

### Product shape

Two modes, one web app, one git repo (`pocket-ledger`):

- **Signed out** — today’s ledger: Dexie, PWA, offline after first load, **no API**. Optional **device passphrase** (≥ 8).
- **Signed in** — Google Sign-In **only**. **Account passphrase mandatory** (≥ 8). **E2E.** Automatic sync. **Online** for money. Dexie is a **cache**.
- Never force Google on local-only users.

### Hosting and repo

- Leave Cloudflare. Host on **GCP**: two **Cloud Run** services (web static + API). Default `*.run.app` is OK.
- npm workspaces: `apps/web` (SvelteKit, `adapter-static`, **path** URLs, keep service worker) + `apps/api` (Hono). `openapi.yaml` in this repo.
- Path-filtered GitHub Actions: web change does not redeploy API, and vice versa.
- **Android later**, second GitHub repo (`pocket-ledger-android`). Not in this repo.
- Cutover = **new origin** = **empty IndexedDB** (Cloudflare data does not move).
- Two origins + CORS. Session cookie on the **API** host (not same-origin cookies).

### Device lock (signed out)

- Optional. Distinct UI from account lock. Skippable, with a **neutral warning** (not a blocking modal):
  - Heading: `This device is not encrypted`
  - Body: `Without a passphrase, anyone who can use this browser can read your ledger if the device is lost or left unlocked. Set a passphrase to encrypt it on this device.`
  - Toggle: `No passphrase: data on this device can be read if access is lost or shared.`
  - Button: `Set a passphrase`
- **Always-on DEK:** rows are ciphertext after a one-time migrate. Passphrase **off:** DEK stored **raw** in IDB. Passphrase **on:** only salt + wrapped DEK. Set / change / unset = **re-wrap only**, no row rewrite.
- Encrypt on write, decrypt **per read**. No whole-table RAM load.
- Plain: **ids** + **non-secret settings**. Ciphertext: amounts, dates, names, notes, types, void flags, pocket fields — the rest.
- **No local recovery key.** Forgot device passphrase → this browser’s data is gone unless they already exported.
- Optional **WebAuthn** (needs a passphrase): this-device third box. Cold visit **and** idle: WebAuthn first (`userVerification: required`), fallback passphrase.
- **Wrong-guess ladder (device typed passphrase only; not WebAuthn):** every **3** consecutive wrongs. Success resets the 3-count. Rungs: **15m → 30m → 1h → 3h → 6h → 12h → 1 day max**. Rung remembered. At max: wait until **next local midnight**; another 3 fails → **following midnight**. Cool-down: drop **one** rung only on a calendar day with **≥1 success and 0 wrongs**. Counter is **plaintext settings** (honest: IDB editor can reset it).

### Account lock (signed in)

- **Mandatory.** Same secret on every device. Never sent to Hono. **Cannot remove** while signed in. **Change only** (re-wrap DEK).
- Replaces this device’s device passphrase (notify). Distinct UI.
- **Hex recovery kit** on first set: 32 random bytes, grouped hex, case-insensitive input. Copy **or** download + checkbox “I stored this.” No password-manager API. Recovery wrap uploaded **only after** confirm.
- Forgot passphrase: hex kit, or another device still unlocked. Lose both + every unlocked device → **bricks**. Email cannot decrypt.
- **No** cloud typed-guess limit in v1.
- WebAuthn while signed in: **third box this device only** (not synced).

### Onboarding (must finish; resume if cut off)

Pipeline: device unlock (if any) → Google → local-discard warning (if needed) → **set** passphrase (new) or **enter** / hex (returning) → hex kit (new accounts) → ledger.

No money UI (Activity / Pockets / More) until complete. Close tab / refresh / navigate away → **resume the incomplete step**.

### Sign-in vs local data

Never overwrite **existing** cloud history. No “which copy?”. **Has data** = anything that is not a virgin install (default Main + default settings). Settings-only counts.

- Cloud **empty**, local has data → **upload local**.
- Cloud **has data**, local has data → blocking **warning**: local will be **discarded**. Suggest encrypted export first. Cancel → stay signed out. Consent → wipe local, pull cloud.
- Cloud has data, local virgin → pull cloud; enter passphrase/hex.
- Both virgin → Google → set passphrase → hex kit → ledger.

### Sign-out / start-fresh local-only

**Wipe all local data**. Cloud on the server **untouched**. Warn: no signed-in export, so cloud is the only remaining copy.

### Screensaver / idle

Always (signed out and signed in). Overlay: black, slight transparency, icon + short text. **DEK dropped from RAM.**

- Signed out, no passphrase: `Click to continue` (reload raw DEK).
- Signed out, passphrase on: `Click to unlock` → WebAuthn then device passphrase.
- Signed in: always `Click to unlock` → WebAuthn then account passphrase.

**Idle after:** 5 / 10 / 15 / **30** min (default 30). **When I leave this tab:** default **on**. Theme, idle, and other settings **sync with the ledger** while signed in.

### Backup (signed-out only)

Encrypted envelope. Old `formatVersion: 1` **rejected**. Hidden while signed in.

### Sync v1 (signed-in)

Server stores **ciphertext**. Save with `rev`; newer server `rev` → **409** → **close editor, discard typing, refresh**. Deletes = **gravestones**. Wraps = one account coat-check (`wrapRev`). Pull on unlock, after save, **30s** poll. **No offline queue**. Settings sync as ledger data.

### Session

API cookie: **7-day rolling**, HttpOnly Secure. **Session manager:** list sessions, revoke.

### Crypto numbers

| Item | Value |
|------|--------|
| Passphrase min | 8 characters (device and account) |
| PBKDF2 | SHA-256, 600,000 iterations |
| Recovery kit | 32 bytes, grouped hex, case-insensitive |
| Sync poll | 30s + pull on unlock + after save |
| Session cookie | 7-day rolling, HttpOnly Secure |
| Blobs | Postgres `bytea` |
| Idle choices | 5 / 10 / 15 / 30 min (default 30) |
| Device lockout | 3 wrongs per rung; 15m…1 day at midnight |
| Kit UX | copy **or** download + checkbox |

### Threat model (honest)

Not a bank. XSS after unlock wins. Signed out, no passphrase: DEK sits next to ciphertext. Signed in: Google without the passphrase cannot read. Operator never has the DEK. Local lockout counter is not fail-closed.

---

## Appendix B — Dropped (will not do)

Must appear in PRODUCT (or a clearly linked section):

- **3-repo** split (web / api / android as three products in one monorepo)
- **Separate `pocket-ledger-api` GitHub repo**
- **Android in this repo**
- **Firebase Auth / Firestore** as the ledger
- **Cloudflare** hosting (Workers/Pages) as the target
- **Fly.io**
- **Same-origin cookies**
- **Cloud KMS envelope** for “signed in without a passphrase”
- **Optional account passphrase**
- **6-digit PIN**
- **Forced Google** for local-only users
- **Email/password** auth
- **“Which copy?”** chooser
- **Local recovery key**
- **Keep Dexie cache on sign-out**
- **Silent last-PUT-wins**
- **BIP39 word recovery kit**
- **Fake password-manager trigger**
- **Plaintext JSON export/import** going forward; **import of old `formatVersion: 1`**
- **Signed-in file export/import**
- **Signed-in offline mutation queue** / CRDTs / per-field merge
- **Email as data recovery**
- **Clerk**, **adapter-node** web host, **Cloud Build**
- **Hash router** as the target (path URLs). Do not drop the SW for signed-out offline
- **Loading the whole ledger into RAM**
- **Manual “upload JSON to cloud”** as the signed-in product

---

## Appendix C — Parked (later, not v1)

- **Cloud lockout** (3 wrong account passphrases → freeze) + **outbound email**
- **Wipe cloud and start empty** / **delete account**
- **Argon2id** (envelope is ready to switch)
- **Android** (`pocket-ledger-android`)
- **Custom domain**
- **GCS** for blobs (Postgres `bytea` until size hurts)
- Mail sender / free email (Resend etc. only if we later want lockout mail)

---

## Appendix D — Architecture (must appear in ARCHITECTURE)

```text
pocket-ledger/
  apps/web          SvelteKit PWA, adapter-static, path routes, Dexie
  apps/api          Hono (Google ID token → session cookie, sync)
  openapi.yaml
  Dockerfile.web
  Dockerfile.api
```

**Stack:** Svelte 5 + shadcn, Dexie, Hono, Cloud SQL (users, sessions, sync metadata, **bytea** ciphertext), GitHub Actions + Workload Identity Federation.

**Server may store:** user id, session, `kind`, `id`, `rev`, `deleted`, ciphertext blob, wrap envelopes (salt, kdf id, wrapped DEKs, wrapRev). **Never:** passphrase, hex kit, raw DEK.

**Client RAM after unlock:** DEK. Dropped on screensaver.

Wrapping (ELI5 for ARCHITECTURE or ADR 0008): diary pages use one **metal key** (DEK). Passphrase / hex / WebAuthn are **boxes** around copies of that key. Change password = new box, same key. Email cannot open a box. Today’s `lock.ts` is **direct derive**; target is random DEK + PBKDF2 box key + AES-GCM wrap.

---

## Appendix E — Flows (must appear in PRODUCT or ARCHITECTURE)

1. **New account:** More/sign-in → device unlock if any → Google → upload-local or virgin → set passphrase → hex kit → ledger. Cut off after Google → resume that box. Recovery wrap is not on the server until kit confirm.
2. **Returning account:** Google → resume incomplete onboarding else enter passphrase or hex → ledger. WebAuthn first if enrolled on this device. Closed tab mid-unlock → still unlock, not ledger.
3. **Cloud already has data + this device has data:** warn (local discarded) → cancel = signed out → consent = wipe local, pull cloud, enter passphrase/hex.
4. **Sign-out / start-fresh:** confirm (cloud is the only copy) → wipe IDB + session → virgin signed-out app.
5. **Idle:** timer or hide-tab → overlay + drop DEK → click → continue or unlock.
6. **Save while signed in:** PUT with `rev` → success new `rev` + pull; **409** close editor, drop draft, pull.
7. **Delete:** PUT gravestone with CAS.
8. **Change account passphrase:** re-wrap DEK, PUT coat-check (`wrapRev` CAS). Rows unchanged.
9. **Forgot account passphrase:** hex kit → new wrap, or change from a still-unlocked device. Else bricks.
10. **Local set / unset device passphrase:** re-wrap only. No `sealAll` / `openAll` except one-time plaintext migrate.
11. **Encrypted backup:** signed out only. Export proves passphrase (device or one-time). Import: file passphrase, replace IDB.
