# Data model (v1)

## accounts

| Field | Notes |
|-------|-------|
| id | UUID |
| name | e.g. `Main` |
| currencyLabel | Display only |
| createdAt | ISO string |

## categories

| Field | Notes |
|-------|-------|
| id | UUID |
| name | |
| kind | `income` \| `expense` |
| createdAt | |

## transactions

Simple ledger row, double-entry-ready:

| Field | Notes |
|-------|-------|
| id | UUID |
| accountId | Required |
| counterAccountId | Null for income/expense; set for future transfers |
| type | `income` \| `expense` \| `transfer` |
| amountMinor | Integer |
| categoryId | Nullable |
| note | |
| occurredOn | Date key |
| createdAt | |

## settings

Key/value. Reserved: `encryption.enabled` = `false` by default (not written until feature lands).
