# Spec 013: Desktop-first responsive shell

- **ID:** 013
- **Status:** Accepted (chrome + Home dashboard polish)
- **Owner:** Ronald / Vex

## Intent

Desktop-first **dashboard shell**: open/close nav drawer, lean toolbar, Home balance + month panel + recent txs, Activity table, ⌘K command palette. Mobile: overlay drawer, stacked layout (no floating Add button).

## Scope

### Chrome — navigation drawer

- shadcn **Sidebar** `collapsible="offcanvas"` (not icon rail)
- Header: product icon (`/favicon.svg`) + Pocket Ledger + account name
- Nav: icons + labels; **hover and current route** use `sidebar-accent` highlight; `aria-current="page"` on active; items use **large** menu button height (`size="lg"`, 48px)
- No “Menu” / “Overview” label; no Add in drawer
- Open/close **animates** on desktop and mobile (mobile: slide + scrim fade)

### Chrome — toolbar

- Menu trigger | page title | spacer | **icon-only theme cycle** (Light → System → Dark), rightmost
- No Search, no Add, no currency/pot stage context
- Command palette: **⌘/Ctrl+K** only

### Chrome — mobile

- Overlay drawer (sheet); **no floating Add (FAB)**
- Add via Home Recent / empty CTAs, Activity empty CTA, or ⌘/Ctrl+K

### Home

1. **Balance** — current account balance only (not month-scoped)
2. **Month panel** — navigator; income / expense / net for selected month; income and expense by category; footer **opening + net = ending** (opening = signed ledger sum before month; ending = opening + net)
3. **Recent** — newest 5 txs; Add button on card; each row clickable → edit

### Other pages

- Activity table; Categories columns; More grid — unchanged in structure

### Add / edit

- Desktop: dialog; Mobile: bottom sheet; also ⌘K → Add; Home Recent Add; empty CTAs

### Routes

- Unchanged hash routes

### Out of scope

- Table sort/filter; relocating currency/pot mode; icon-collapsed rail; brand redesign

## Domain rules

- Month summary includes `incomeByCategory`, `expenseByCategory`, `openingMinor`, `endingMinor`
- Signed amounts: income `+`, expense `-`

## Acceptance scenarios

### Drawer nav highlight

- **Given** the drawer is open
- **When** the user hovers a nav item or views the current route
- **Then** hover/active items show accent background; current route has `aria-current="page"`

### Lean toolbar

- **Given** the app is ready
- **When** the toolbar is visible
- **Then** there is no Search, toolbar Add, or currency/pot context; theme is an icon cycle on the right

### Home dashboard

- **Given** Home with transactions
- **When** the stage renders
- **Then** current balance is at top; month panel shows month totals, category breakdowns, and opening/net/ending; Recent shows up to 5 clickable rows and an Add control

### Command palette add

- **Given** desktop viewport
- **When** the user presses ⌘/Ctrl+K and chooses Add transaction
- **Then** the add dialog opens

### No mobile FAB

- **Given** narrow viewport
- **When** the shell is ready
- **Then** there is no floating Add control; add opens from Recent/empty CTAs or ⌘/Ctrl+K into the bottom sheet

### Flows still work

- Prior specs for add/edit/delete, More, Categories still hold

## Traceability

- Playwright: `e2e/desktop-layout.e2e.ts`, `e2e/month-charts.e2e.ts`, `e2e/nav.ts`
- Domain: `src/lib/domain/month-summary.ts`
- UI: `AppShellChrome.svelte`, `MonthSummary.svelte`, `ThemeMenu.svelte`, this spec

## Wireframe (desktop)

```text
┌──────────┬──────────────────────────────────┐
│ [icon]   │ [=] Home                    [☀] │
│ Pocket   ├──────────────────────────────────┤
│ Main     │ Balance                          │
│          │ ┌ Month ‹ July 2026 › ─────────┐ │
│  Home    │ │ Inc | Exp | Net              │ │
│  Activity│ │ Categories…                  │ │
│  Categ.  │ │ Opening + Net = Ending       │ │
│  More    │ └──────────────────────────────┘ │
│          │ ┌ Recent ──────────── [+ Add] ─┐ │
│          │ │ tx rows…                     │ │
│          │ └──────────────────────────────┘ │
└──────────┴──────────────────────────────────┘
```
