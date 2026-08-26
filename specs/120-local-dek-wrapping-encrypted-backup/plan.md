# Plan 120: Always-on local DEK wrapping; encrypted local-only backup

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 007/011 lock; Spec 119 account wrap; Spec 121 still uses same DEK

## Why

Today lock is passphrase → AES key (`lock.ts`). Always-on DEK + wrap/raw storage lets set/unset passphrase without rewriting rows. Encrypted export replaces plaintext JSON so backups match ciphertext-at-rest.

## Approach

Random 32-byte DEK. Passphrase off: store raw DEK in IDB. On: salt + wrapped DEK only. One-time migrate plaintext → sealed rows. Encrypt on write, decrypt per read. Encrypted envelope export/import signed-out only. Reject `formatVersion: 1`. No local recovery kit.

## Scope / edges

**In:** wrapping, migrate, screensaver DEK drop (if not already), encrypted backup, hide backup when signed in.

**Out:** Google, hex kit upload (119), sync 409 (121). Account wrap uses the same wrap format when 119 is live.
