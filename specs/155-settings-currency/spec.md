# Spec 155: Settings currency

- **ID:** 155
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Let the user pick the **display** currency for the whole app from Settings. One ISO code, no FX. Searchable list; Save / Cancel / Default.

## Scope

### In scope

1. **Card** — `settings-section-currency`, title **Currency**, inner section + footer **Save** / **Cancel** / **Default** (`currency-save`, `currency-cancel`, `currency-default`).
2. **Dropdown** — Searchable (`currency-picker`, `currency-picker-search`). Each row: ISO code, then a gap, then `Name - Symbol` (e.g. `IDR` then `Indonesian Rupiah - Rp`). Search matches **ISO or name**, case-insensitive, not the symbol.
3. **Catalog** — `Intl.supportedValuesOf('currency')` + `Intl.DisplayNames` (`currency`) + `NumberFormat` for the symbol. No extra ISO package. Sort by ISO. If `IDR` is missing from the runtime list, still include it.
4. **Storage** — Settings key `displayCurrency` (ISO 4217). Default `IDR`. [`formatMinor`](../../apps/web/src/lib/domain/money.ts) and shell money read this (fallback IDR). On **Save**, write `currencyLabel` on **every** pocket to that ISO so backups stay consistent. Signed-in: sync as settings (121).
5. **Draft footer** (shared 154 wave rules):
   - Draft vs stored. **Save** applies (disabled when draft equals stored).
   - **Cancel** restores draft from stored (disabled when already stored).
   - **Default** sets draft to `IDR` (disabled when draft is already `IDR`). Does not persist until Save.

### Out of scope

- Live FX; multiple currencies per pocket
- Changing integer minor-unit math

## Domain rules

- Stored value is a 3-letter ISO code present in the catalog (or `IDR`).
- Invalid stored value → treat as `IDR` on parse (like idle minutes).
- Pocket `currencyLabel` is display-only; after 155 the settings key is source of truth at runtime, pockets updated on Save.

## Acceptance scenarios

### Scenario: Default IDR

- **Given** a virgin install
- **When** Settings → Currency
- **Then** the picker shows IDR
- **And** Save and Cancel are disabled
- **And** Default is disabled

### Scenario: Search and row format

- **Given** the currency picker open
- **When** the user types `rup`
- **Then** IDR (Indonesian Rupiah) is among the matches
- **When** they type `USD`
- **Then** USD matches by ISO
- **And** each visible row has ISO, then name, then symbol after a hyphen

### Scenario: Save Cancel Default

- **Given** stored IDR
- **When** the user picks USD
- **Then** Save and Cancel are enabled; Default is enabled
- **When** they Cancel
- **Then** the draft is IDR again and money UI is still IDR
- **When** they pick USD and Save
- **Then** amounts use USD and every pocket’s `currencyLabel` is `USD`
- **When** they Default then Save
- **Then** the stored code is IDR

## Traceability

- Vitest: `apps/web/src/lib/domain/display-currency.test.ts` (parse, search, row label, IDR fallback); application save writes pockets + setting
- Playwright: Settings currency picker / save / cancel / default; money label on Home
- Implementation: domain catalog helpers; settings key; `formatMinor` / shell wiring; Currency card in Settings panel
- Docs: PRODUCT currency row; DATA_MODEL settings

## Related

- 154 hub order; 000 default IDR; 121 settings sync
