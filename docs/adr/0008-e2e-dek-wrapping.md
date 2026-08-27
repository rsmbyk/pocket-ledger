# ADR 0008: End-to-end DEK wrapping (no operator key)

## Status

Accepted

## Context

Today’s lock derives an AES key directly from the passphrase (`lock.ts`). Signed-in cloud storage must never let the operator read the ledger. Optional account passphrase and Cloud KMS “signed in without a passphrase” were tried and **rejected** — that would put a DEK (or unwrap capability) on the server.

## Decision

- Random **DEK** (32 bytes) seals rows (AES-GCM). `field-crypto` only sees the DEK in RAM.
- Passphrase / hex kit / WebAuthn are **boxes** around copies of that DEK (PBKDF2-SHA-256, 600,000 iterations, then AES-GCM wrap). Change passphrase = new box, same key.
- Signed out, passphrase off: store the DEK **raw** in IndexedDB (honest: anyone with the origin can read).
- Signed in: account passphrase is **mandatory**. Wraps (coat-check) may live on the server; passphrase, hex kit, and raw DEK **never** do.
- No Cloud KMS envelope. No local recovery key. Forgot device passphrase without an export → this origin is gone. Forgot account passphrase without hex kit and without an unlocked device → bricks.
- Envelope stores `kdf` + params so Argon2id can replace PBKDF2 later without a format surprise.

## Consequences

- Set / unset / change passphrase is a re-wrap, not a row rewrite (after one-time plaintext migrate).
- Google Sign-In without the passphrase cannot decrypt.
- XSS after unlock still wins. Local lockout counters in plaintext settings are not fail-closed.
