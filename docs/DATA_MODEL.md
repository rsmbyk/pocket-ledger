# Data model (v1)

Dexie database `pocket-ledger`. UI calls accounts **Pockets**; the object store name remains `accounts`.

## accounts (Pockets)

| Field               | Notes                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                  | UUID                                                                                                                                                               |
| name                | Display name (default seed `Main`)                                                                                                                                 |
| currencyLabel       | Display only (default `IDR`)                                                                                                                                       |
| createdAt           | ISO string                                                                                                                                                         |
| isMain              | Exactly one Main after ensure; rename does not clear                                                                                                               |
| sortOrder           | Order among non-Main pockets; Main always listed first                                                                                                             |
| notes               | Free text                                                                                                                                                          |
| openingBalanceMinor | Signed integer minor units                                                                                                                                         |
| openingAsOf         | `YYYY-MM-DD` — txs before this date excluded from **current** derived balance (spec 071); also seeds month Opening via day-start inference forward/back (spec 110) |
| goalTargetMinor     | Optional goal target; `null` = no goal                                                                                                                             |
| goalTargetOn        | Optional deadline `YYYY-MM-DD`; `null` = target-only                                                                                                               |

Backup JSON may still key this collection as `accounts`.

## categories

Stock catalog is **not** stored here (spec 123). This table holds **custom** categories only.

| Field     | Notes                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------- |
| id        | UUID (custom). Stock ids like `stock:expense:groceries` live in the app bundle, not this table |
| name      | Encrypted display name                                                                         |
| kind      | `income` \| `expense`                                                                          |
| sortOrder | Unused for UI order (catalog then custom `createdAt`)                                          |
| createdAt |                                                                                                |
| deletedAt | Legacy; hide uses `hidden`                                                                     |
| groupId   | Stock or custom group id                                                                       |
| icon      | Always `tag` for custom                                                                        |
| hidden    | When true, omitted from pickers; still listed on Categories                                    |

## categoryGroups

Custom groups only. Stock groups (`stock-group:home`, …) are in the bundle.

| Field     | Notes                                      |
| --------- | ------------------------------------------ |
| id        | UUID                                       |
| name      | Encrypted                                  |
| kind      | `income` \| `expense`                      |
| createdAt | New groups are last among that kind        |

## Overlay prefs (`settings`)

| Key                       | Notes                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `category.overlayPrefs`   | JSON: `hiddenStockIds`, `groupOrderByKind` (only when order differs from factory)              |
| `category.catalogMigrated`| `123` after one-time UUID → stock migrate                                                      |

Backup JSON includes custom `categories`, `categoryGroups`, and these settings — not the stock catalog.

## transactions

Simple ledger row, double-entry-ready:

| Field            | Notes                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| id               | UUID                                                                                                              |
| accountId        | Source pocket (income/expense pocket; transfer source)                                                            |
| counterAccountId | Null for income/expense; destination pocket for transfers                                                         |
| type             | `income` \| `expense` \| `transfer`                                                                               |
| amountMinor      | Positive integer; sign from type / transfer direction (transfer = amount sent = dest receives)                    |
| feeMinor         | Non-negative integer; transfer admin fee (Spec 106); always `0` for income/expense; missing on read/restore → `0` |
| categoryId       | Nullable; always null for transfers (fee uses synthetic Admin Fee bucket, not categoryId)                         |
| note             |                                                                                                                   |
| occurredOn       | Date key `YYYY-MM-DD`                                                                                             |
| createdAt        |                                                                                                                   |
| voidedAt         | ISO timestamp or null                                                                                             |

## goals (legacy)

Table retained for migrations/backups. Live UI goals live on `accounts` goal fields (spec 072). Upgrade/restore migrates at most one nearest-deadline goal onto Main, then clears live `goals` usage.

## settings

Key/value. Reserved: `encryption.enabled` = `false` by default (not written until feature lands).
