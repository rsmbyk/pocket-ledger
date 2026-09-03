# Product decisions

Living record of locked choices for Pocket Ledger. Update this file in the same PR when a decision changes.

## Goal

Personal finance app with **two modes**, one web app, one git repo (`pocket-ledger`):

- **Signed out** — Dexie, PWA, offline after first load, **no API**. Optional device passphrase.
- **Signed in** — Google Sign-In only, **mandatory account passphrase**, end-to-end encryption, automatic sync. **Online** for money. Dexie is a cache.

Never force Google on local-only users. Hosting target is **GCP Cloud Run** (not Cloudflare).

Code still matches the pre-cloud client until Specs 116–121 land; this file is the product contract those slices implement.

## Locked

| Area                                 | Decision                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                                 | `pocket-ledger`                                                                                                                                                                                                                                                                     |
| Hosting                              | **GCP** two Cloud Run services (static web + API). Default `*.run.app` is OK. Custom domain parked.                                                                                                                                                                                 |
| Client                               | Svelte 5 + shadcn-svelte + Tailwind. Target: SvelteKit `adapter-static`, **path** URLs, keep PWA (Spec 117).                                                                                                                                                                        |
| Repo                                 | npm workspaces: `apps/web` + `apps/api` (Hono). `openapi.yaml` in this repo. Android is a **second GitHub repo**, not this tree.                                                                                                                                                    |
| Auth                                 | Google Sign-In **only** for cloud. No email/password.                                                                                                                                                                                                                               |
| Storage (signed out)                 | IndexedDB via Dexie is the only ledger                                                                                                                                                                                                                                              |
| Storage (signed in)                  | Dexie cache; Cloud SQL stores ciphertext + sync metadata                                                                                                                                                                                                                            |
| Encryption                           | Always-on DEK after one-time migrate. Device passphrase optional; account passphrase **mandatory** while signed in.                                                                                                                                                                 |
| Backup                               | Encrypted envelope, **signed-out only**. Old plaintext `formatVersion: 1` rejected. Hidden while signed in.                                                                                                                                                                         |
| Sync                                 | Signed-in only. Server `rev` CAS; **409** closes the editor. Gravestones. 30s poll. No offline queue.                                                                                                                                                                               |
| Session                              | API cookie, 7-day rolling, HttpOnly Secure. Session manager (list + revoke).                                                                                                                                                                                                        |
| UI kit                               | shadcn-svelte (Vega / Lucide) + Tailwind                                                                                                                                                                                                                                            |
| Theme                                | Dark mode from day one; default **system**; Light / Dark / System override. Theme and idle **sync with the ledger** while signed in.                                                                                                                                                |
| Visual                               | **Mist** surfaces, **Ink** primary, **Figtree**, **7px** radius, Current+ cards, Brick money/charts/danger, Soft chart hover, Lift sheets, Quiet focus, overlay-fade scrollbars, buttons use desktop height at every viewport (spec 133) |
| Ledger                               | Simple ledger now; schema open for double-entry later                                                                                                                                                                                                                               |
| Accounts                             | Multi-account capable; **single-pot UX** when only one account; start with default `Main`                                                                                                                                                                                           |
| Pockets                              | User-managed sub-accounts (**Pockets** nav item); `Main` is pinned first, never deleted, always the default for new transactions; non-Main pockets are user-reorderable (drag), renameable, and deletable once empty (spec 070); click a card for `/pockets/:id` details (spec 148) |
| Pocket opening balance               | Each pocket has an opening balance + as-of date that seeds its derived running balance (spec 071)                                                                                                                                                                                   |
| Month Opening / Ending               | Home month Opening = sum of each pocket’s balance at month-start, inferred by walking txs backward/forward from that pocket’s opening as-of; Ending = Opening + Net (spec 110)                                                                                                      |
| Goals                                | Per-pocket balance + deadline goal (target amount, target date), not a separate global feature; editable/clearable from the pocket's edit dialog (spec 072)                                                                                                                         |
| Transfers                            | Move money between pockets as a single `transfer` transaction (source → dest, amount sent, optional admin fee, optional note); shown as a neutral row; fee counts as expense under synthetic **Admin Fee** (spec 073 / 106)                                                         |
| Currency                             | Single currency; display label only (default `IDR`)                                                                                                                                                                                                                                 |
| Budgets                              | None for now                                                                                                                                                                                                                                                                        |
| Multi-currency / FX                  | None                                                                                                                                                                                                                                                                                |
| UX                                   | **Desktop-first dashboard chrome**, responsive down to mobile (inset sidebar → sheet + stacked layouts below `md`)                                                                                                                                                                  |
| Features (shipped)                   | Charts, export — specs 001–008; net worth UI removed (059); recurring removed (087); Pockets nav + CRUD, per-pocket opening balance, per-pocket goals, transfers, Transactions pocket filter, row pocket labels — specs 070–077 / 134; month Opening from pocket openings — spec 110; pocket details dashboard — spec 148 |
| Categories                           | Stock catalog in the app bundle (overlay in Dexie: custom groups/categories, hidden stock ids, group order). List per group; hide instead of delete; searchable grouped form picker (spec 123). Custom icon always `tag`. Uncategorized `circle-dashed`; Admin Fee `percent`. |
| Tests                                | Vitest + Playwright from the start                                                                                                                                                                                                                                                  |
| Process                              | Spec-Driven Development + TDD + GitHub Flow                                                                                                                                                                                                                                         |
| Desktop shell                        | No Tauri; desktop-first dashboard shell (inset sidebar + KPI home + wide stage, spec 013)                                                                                                                                                                                           |
| Insights / receipts / household sync | Out of scope for now                                                                                                                                                                                                                                                                |

## Modes

### Signed out

Today’s ledger: Dexie, PWA, offline after first load, **no API**. Optional **device passphrase** (≥ 8 characters). Distinct UI from account lock. Skippable, with a **neutral warning** (not a blocking modal):

- Heading: `This device is not encrypted`
- Body: `Without a passphrase, anyone who can use this browser can read your ledger if the device is lost or left unlocked. Set a passphrase to encrypt it on this device.`
- Toggle: `No passphrase: data on this device can be read if access is lost or shared.`
- Button: `Set a passphrase`

**No local recovery key.** Forgot device passphrase → this browser’s data is gone unless they already exported.

### Signed in

Google Sign-In **only**. **Account passphrase mandatory** (≥ 8). Same secret on every device. Never sent to the API. **Cannot remove** while signed in; **change only** (re-wrap DEK). Replaces this device’s device passphrase (notify). **E2E.** Automatic sync. **Online** for money.

Forgot account passphrase: hex recovery kit, or another device still unlocked. Lose both + every unlocked device → **bricks**. Email cannot decrypt.

## Locks and wrapping

**Always-on DEK:** rows are ciphertext after a one-time migrate. Passphrase **off:** DEK stored **raw** in IndexedDB. Passphrase **on:** only salt + wrapped DEK. Set / change / unset = **re-wrap only**, no row rewrite.

Encrypt on write, decrypt **per read**. No whole-table RAM load. Math after unlock; month views stream/decrypt (no Dexie range indexes on encrypted dates).

Plain at rest: **ids** + **non-secret settings**. Ciphertext: amounts, dates, names, notes, types, void flags, pocket fields — the rest.

Optional **WebAuthn** (needs a passphrase): this-device third box, not synced. Cold visit **and** idle: WebAuthn first (`userVerification: required`), fallback passphrase.

**Wrong-guess ladder** (device typed passphrase only; not WebAuthn; not account passphrase): every **3** consecutive wrongs. Success resets the 3-count. Rungs: **15m → 30m → 1h → 3h → 6h → 12h → 1 day max**. At max: wait until **next local midnight**. Cool-down: drop **one** rung only on a calendar day with **≥1 success and 0 wrongs**. Counter is plaintext settings (honest: an IndexedDB editor can reset it). **No** cloud typed-guess limit in v1.

**Hex recovery kit** (new accounts, first set): 32 random bytes, grouped hex, case-insensitive input. Copy **or** download + checkbox “I stored this.” No password-manager API. Recovery wrap uploaded **only after** confirm.

## Onboarding (must finish; resume if cut off)

Pipeline: device unlock (if any) → Google → local-discard warning (if needed) → **set** passphrase (new) or **enter** / hex (returning) → hex kit (new accounts) → ledger.

No money UI (Transactions / Pockets / More) until complete. Close tab / refresh / navigate away → **resume the incomplete step**.

- Google, no passphrase wrap yet → set-passphrase.
- Passphrase wrap on server, kit not confirmed → hex screen. If the shown hex is gone, **mint a new** hex (unconfirmed never lived on the server).
- Kit confirmed → later visits: passphrase or WebAuthn.
- Incomplete enter-passphrase on a returning account → resume unlock, not the ledger.
- Sign-out wipes this device; sign in again continues the unfinished **account** on the server.

## Sign-in vs local data

Never overwrite **existing** cloud history. No “which copy?”.

**Has data** = anything that is not a virgin install (default Main + default settings). Settings-only counts.

- Cloud **empty**, local has data → **upload local** (creates cloud history; wrap that DEK with the new account passphrase + kit).
- Cloud **has data**, local has data → blocking **warning**: local will be **discarded**. Suggest encrypted export first (or sign in on an empty device). Cancel → stay signed out. Consent → wipe local, pull cloud, enter passphrase/hex.
- Cloud has data, local virgin → pull cloud; enter passphrase/hex.
- Both virgin → Google → set passphrase → hex kit → ledger.

## Sign-out / start-fresh local-only

**Wipe all local data** (Dexie, wraps, DEK, session, Google leftovers). Fresh signed-out app. Cloud on the server **untouched**. Warn: no signed-in export, so cloud is the only remaining copy.

## Screensaver / idle

Always (signed out and signed in). Overlay: black, slight transparency, icon + short text. **DEK dropped from RAM.**

- Signed out, no passphrase: `Click to continue` (reload raw DEK).
- Signed out, passphrase on: `Click to unlock` → WebAuthn then device passphrase.
- Signed in: always `Click to unlock` → WebAuthn then account passphrase.

**Idle after:** 5 / 10 / 15 / **30** min (default 30). **When I leave this tab:** default **on**.

## Backup (signed-out only)

Encrypted envelope (version, salt, wrapped DEK, sealed rows as stored). Not plaintext JSON. Old `formatVersion: 1` **rejected**.

- Device passphrase on → prompt it (even if already unlocked).
- Off → one-time export passphrase (≥ 8); does **not** enable device lock.
- Import: prompt file passphrase; full replace (as spec 003); then wrap or store raw DEK locally.
- **Hidden while signed in**.

## Sync v1 (signed-in)

Server stores **ciphertext**. Cannot field-merge. Unit = one encrypted entity + plain `id`, `kind`, server monotonic `rev`, `deleted`.

- Save sends the `rev` this device read. Newer server `rev` → **409** → **close editor, discard typing, refresh**. No merge.
- Deletes = **gravestones** (`deleted=true`, bump `rev`). Same 409 rule.
- Wraps = one account coat-check (passphrase box + hex box, `wrapRev`). Change passphrase = update that record only, not every row. Same DEK.
- Catch-up: pull on unlock, pull after successful save, **30s** poll while visible and unlocked. **No offline queue** (save fails without network).
- Settings (theme, idle, etc.) sync as ledger data.

## Session

API cookie: **7-day rolling**, HttpOnly Secure, on the **API** host (two Cloud Run origins + CORS). Idle still dumps the DEK. **Session manager:** list sessions, revoke (sign out that device).

## Crypto numbers

| Item           | Value                                    |
| -------------- | ---------------------------------------- |
| Passphrase min | 8 characters (device and account)        |
| PBKDF2         | SHA-256, 600,000 iterations              |
| Recovery kit   | 32 bytes, grouped hex, case-insensitive  |
| Sync poll      | 30s + pull on unlock + after save        |
| Session cookie | 7-day rolling, HttpOnly Secure           |
| Blobs          | Postgres `bytea`                         |
| Idle choices   | 5 / 10 / 15 / 30 min (default 30)        |
| Device lockout | 3 wrongs per rung; 15m…1 day at midnight |
| Kit UX         | copy **or** download + checkbox          |

Argon2id is **parked** (envelope stores `kdf` + params so we can switch later). AES-GCM for wraps and rows.

## Threat model (honest)

Not a bank. XSS after unlock wins. Signed out, no passphrase: DEK sits next to ciphertext. Signed in: Google without the passphrase cannot read. Operator never has the DEK. Local lockout counter is not fail-closed.

## Flows

1. **New account:** More/sign-in → device unlock if any → Google → upload-local or virgin → set passphrase → hex kit → ledger. Cut off after Google → resume that box. Recovery wrap is not on the server until kit confirm.
2. **Returning account:** Google → resume incomplete onboarding else enter passphrase or hex → ledger. WebAuthn first if enrolled on this device. Closed tab mid-unlock → still unlock, not ledger.
3. **Cloud already has data + this device has data:** warn (local discarded) → cancel = signed out → consent = wipe local, pull cloud, enter passphrase/hex.
4. **Sign-out / start-fresh:** confirm (cloud is the only copy) → wipe IDB + session → virgin signed-out app.
5. **Idle:** timer or hide-tab → overlay + drop DEK → click → continue or unlock.
6. **Save while signed in:** PUT with `rev` → success new `rev` + pull; **409** close editor, drop draft, pull.
7. **Delete:** PUT gravestone with CAS.
8. **Change account passphrase:** re-wrap DEK, PUT coat-check (`wrapRev` CAS). Rows unchanged.
9. **Forgot account passphrase:** hex kit → new wrap, or change from a still-unlocked device. Else bricks.
10. **Local set / unset device passphrase:** re-wrap only. No whole-table rewrite except one-time plaintext migrate.
11. **Encrypted backup:** signed out only. Export proves passphrase (device or one-time). Import: file passphrase, replace IDB.

## Dropped (will not do)

Tried or proposed, then rejected:

- 3-repo split (web / api / android as three products in one monorepo)
- Separate `pocket-ledger-api` GitHub repo
- Android in this repo
- Firebase Auth / Firestore as the ledger
- Cloudflare hosting (Workers/Pages) as the target
- Fly.io
- Same-origin cookies
- Cloud KMS envelope for “signed in without a passphrase”
- Optional account passphrase
- 6-digit PIN
- Forced Google for local-only users
- Email/password auth
- “Which copy?” chooser (would overwrite cloud history)
- Local recovery key
- Keep Dexie cache on sign-out
- Silent last-PUT-wins
- BIP39 word recovery kit
- Fake password-manager trigger
- Plaintext JSON export/import going forward; import of old `formatVersion: 1`
- Signed-in file export/import
- Signed-in offline mutation queue / CRDTs / per-field merge
- Email as data recovery
- Clerk, adapter-node web host, Cloud Build
- Hash router as the target (path URLs). Do not drop the service worker for signed-out offline
- Loading the whole ledger into RAM
- Manual “upload JSON to cloud” as the signed-in product

## Parked (later, not v1)

- Cloud lockout (3 wrong account passphrases → freeze) + outbound email. Email still cannot decrypt.
- Wipe cloud and start empty / delete account
- Argon2id
- Android (`pocket-ledger-android` — Spec 122)
- Custom domain (default `*.run.app` for now)
- GCS for blobs (Postgres `bytea` until size hurts)
- Mail sender / free email (only if we later want lockout mail)

## Non-goals (current)

- Email/password
- Wipe-cloud / delete-account
- Android sources in this repo
- Multi-user collaboration (beyond one Google account, many devices)
- App Store packaging
- Live FX rates

## Privacy model

- App shell is public; source is on GitHub.
- **Signed out:** ledger never leaves the browser unless the user exports an encrypted backup.
- **Signed in:** server stores ciphertext and wrap envelopes only. Operator never has the passphrase, hex kit, or raw DEK.
- Cutover to a new origin (Cloudflare → Cloud Run) = **empty IndexedDB**. Cloudflare data does not move.
- Clearing site data wipes the local ledger — backups (signed out) or the cloud copy (signed in) matter.
