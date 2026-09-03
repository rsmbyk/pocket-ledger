# Spec 161: Currency picker labels

- **ID:** 161
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Currency picker labels are ISO (monospace) + English name. No symbol suffix.

## Scope

### In scope

1. Closed trigger and every popover row: `{ISO}` then `{name}`. No ` - {symbol}`.
2. ISO in `font-mono`. Name stays the default UI font.
3. Search stays ISO or name, not symbol (155).
4. Drop unused `symbol` / `currencySymbol()` from `CurrencyOption`.

### Out of scope

- Live FX; `formatMinor` / money chrome
- Catalog source (`Intl.supportedValuesOf`)

## Domain rules

- `currencyRowLabel` is ISO, then a gap, then the English name.
- Search does not match a currency symbol.

## Acceptance scenarios

### Scenario: Row is ISO then name

- **Given** the currency picker (open or closed)
- **When** IDR is the selected / listed row
- **Then** visible text is ISO + name (e.g. `IDR` then `Indonesian Rupiah`)
- **And** it does not include a hyphen-symbol suffix
- **And** the ISO code uses a monospace font

### Scenario: Search unchanged

- **Given** the currency picker open
- **When** the user types `USD` or `rup`
- **Then** matches behave as Spec 155 (ISO / name only)

## Traceability

- Vitest: `apps/web/src/lib/domain/display-currency.test.ts` (row label, search, IDR fallback)
- Playwright: `e2e/settings.e2e.ts` — picker has no ` - ` suffix; USD still selectable
- Implementation: `display-currency.ts`; Currency card in `MorePanel.svelte`
- Docs: PRODUCT currency row

## Related

- 155 Settings currency
