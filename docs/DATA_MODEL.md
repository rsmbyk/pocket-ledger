# Data model (v1)

Dexie database `pocket-ledger`. UI calls accounts **Pockets**; the object store name remains `accounts`.

## accounts (Pockets)

| Field | Notes |
|-------|-------|
| id | UUID |
| name | Display name (default seed `Main`) |
| currencyLabel | Display only (default `IDR`) |
| createdAt | ISO string |
| isMain | Exactly one Main after ensure; rename does not clear |
| sortOrder | Order among non-Main pockets; Main always listed first |
| notes | Free text |
| openingBalanceMinor | Signed integer minor units |
| openingAsOf | `YYYY-MM-DD` — txs before this date excluded from derived balance |
| goalTargetMinor | Optional goal target; `null` = no goal |
| goalTargetOn | Optional deadline `YYYY-MM-DD`; `null` = target-only |

Backup JSON may still key this collection as `accounts`.

## categories

| Field | Notes |
|-------|-------|
| id | UUID |
| name | |
| kind | `income` \| `expense` |
| sortOrder | Sibling order within kind |
| createdAt | |

## transactions

Simple ledger row, double-entry-ready:

| Field | Notes |
|-------|-------|
| id | UUID |
| accountId | Source pocket (income/expense pocket; transfer source) |
| counterAccountId | Null for income/expense; destination pocket for transfers |
| type | `income` \| `expense` \| `transfer` |
| amountMinor | Positive integer; sign from type / transfer direction |
| categoryId | Nullable; always null for transfers |
| note | |
| occurredOn | Date key `YYYY-MM-DD` |
| createdAt | |
| voidedAt | ISO timestamp or null |

## goals (legacy)

Table retained for migrations/backups. Live UI goals live on `accounts` goal fields (spec 072). Upgrade/restore migrates at most one nearest-deadline goal onto Main, then clears live `goals` usage.

## settings

Key/value. Reserved: `encryption.enabled` = `false` by default (not written until feature lands).
