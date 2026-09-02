# Specs

Living behavior contracts for Pocket Ledger.

## Rules

1. Spec **before** implementation for user-visible behavior or money rules.
2. Use the [template](_template.md) (or `spec.md` inside a slice folder).
3. Number specs: `000-scaffold.md`, `001-…`. From **047** onward use a folder: `NNN-slug/{plan,spec,tasks}.md`. IDs are **consecutive** — never skip a number (if two concerns merge into one spec, the next slice still uses the next integer).
4. Keep acceptance scenarios in Given / When / Then.
5. Link Vitest and Playwright files under **Traceability**; tasks list those paths for TDD.
6. Update the spec in the same PR as behavior changes.
7. **One concern per spec** — do not mix **unrelated** features in one numbered spec. A single UI surface redesign (e.g. one modal or one menu) may be one spec with multiple acceptance scenarios.

## Index

| Spec                                                   | Title                                                        | Status                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [000](000-scaffold.md)                                 | Scaffold shell, theme, PWA, default account                  | Accepted                                                                     |
| [001](001-transactions.md)                             | Transactions + seed categories                               | Accepted                                                                     |
| [002](002-month-charts.md)                             | Month summary + charts                                       | Accepted                                                                     |
| [003](003-export-import.md)                            | Export & import JSON backup                                  | Accepted                                                                     |
| [004](004-recurring.md)                                | Recurring transactions                                       | Accepted                                                                     |
| [005](005-goals.md)                                    | Goals                                                        | Accepted — progress model superseded by [060](060-goals-have-x-by-y/spec.md) |
| [006](006-net-worth.md)                                | Net worth snapshots                                          | Superseded by [059](059-remove-net-worth/spec.md)                            |
| [007](007-passphrase-lock.md)                          | Optional passphrase lock                                     | Accepted                                                                     |
| [008](008-more-tab.md)                                 | More tab hub                                                 | Accepted                                                                     |
| [009](009-router.md)                                   | Hash router for shell panels                                 | Accepted                                                                     |
| [010](010-custom-categories.md)                        | Custom category management                                   | Accepted                                                                     |
| [011](011-field-encryption.md)                         | Field-level at-rest encryption                               | Accepted                                                                     |
| [012](012-polish.md)                                   | Polish: edit/delete tx + empty states                        | Accepted                                                                     |
| [013](013-desktop-layout.md)                           | Desktop-first shell (responsive drawer on mobile)            | Accepted                                                                     |
| [014](014-void-transactions.md)                        | Void transactions (replace hard delete)                      | Accepted                                                                     |
| [015](015-destructive-confirms.md)                     | Destructive danger buttons + confirms                        | Accepted                                                                     |
| [016](016-activity-balance.md)                         | Remove Activity compact balance                              | Accepted                                                                     |
| [017](017-activity-filters.md)                         | Activity filters + search                                    | Accepted                                                                     |
| [018](018-categories-add-modal.md)                     | Categories add per-kind modal                                | Accepted                                                                     |
| [019](019-drawer-trigger-morph.md)                     | Drawer trigger morphing panel icon                           | Accepted                                                                     |
| [020](020-activity-filters-mobile.md)                  | Activity filters mobile compact layout                       | Accepted                                                                     |
| [021](021-categories-panel-order.md)                   | Categories Income first + right-aligned actions              | Accepted                                                                     |
| [022](022-categories-icon-actions.md)                  | Categories icon-only row actions                             | Accepted                                                                     |
| [023](023-recent-empty-notes.md)                       | Recent empty notes (no type filler)                          | Accepted                                                                     |
| [024](024-reset-all.md)                                | Reset everything (More)                                      | Accepted                                                                     |
| [025](025-no-seed-categories.md)                       | No automatic seed categories                                 | Accepted                                                                     |
| [026](026-recent-short-dates.md)                       | Recent short date display                                    | Accepted                                                                     |
| [027](027-uncategorized-transactions.md)               | Uncategorized transactions                                   | Accepted                                                                     |
| [028](028-month-summary-dividers.md)                   | Month summary section dividers                               | Accepted                                                                     |
| [029](029-more-single-column.md)                       | More panel one card per row                                  | Accepted                                                                     |
| [030](030-remove-void-label.md)                        | Remove Void label from lists                                 | Accepted                                                                     |
| [031](031-month-net-sign-color.md)                     | Month summary Net sign coloring                              | Accepted                                                                     |
| [032](032-list-empty-states.md)                        | List empty states (no CTAs)                                  | Accepted                                                                     |
| [034](034-category-save-emphasis.md)                   | Emphasize active category save                               | Accepted                                                                     |
| [035](035-filters-icon-button.md)                      | Icon-only Activity Filters button                            | Accepted                                                                     |
| [036](036-activity-form-short-dates.md)                | Short dates on Activity and tx form                          | Accepted                                                                     |
| [037](037-transaction-sheet.md)                        | Transaction sheet redesign                                   | Accepted                                                                     |
| [038](038-categories-menu.md)                          | Categories menu redesign                                     | Accepted                                                                     |
| [039](039-transaction-sheet-polish.md)                 | Transaction sheet polish                                     | Accepted                                                                     |
| [040](040-activity-add-categories-dnd.md)              | Activity Add + Categories DnD polish                         | Accepted                                                                     |
| [041](041-modal-platform.md)                           | Modal platform (lifecycle, emphasize, confirms)              | Accepted                                                                     |
| [042](042-dates-and-toasts.md)                         | Dates YY Mon DD, DateField, toasts                           | Accepted                                                                     |
| [043](043-dates-uncategorized-month-order.md)          | Dates DD MMM YYYY, Uncategorized marker, month order         | Accepted                                                                     |
| [044](044-tx-sheet-chrome-dismiss.md)                  | Transaction sheet chrome and outside dismiss                 | Accepted                                                                     |
| [045](045-home-activity-filters.md)                    | Home polish and Activity filters overhaul                    | Accepted                                                                     |
| [046](046-categories-density-no-toasts.md)             | Categories density and remove toasts                         | Accepted                                                                     |
| [047](047-tx-sheet-polish/spec.md)                     | Transaction sheet polish                                     | Accepted                                                                     |
| [048](048-home-amount-hide-icons/spec.md)              | Home amount hide + by-category icons                         | Accepted                                                                     |
| [049](049-activity-toolbar-drawer/spec.md)             | Activity toolbar, drawer, sort icons, Clear                  | Accepted                                                                     |
| [050](050-categories-header-delete/spec.md)            | Categories header density + delete outline                   | Accepted                                                                     |
| [051](051-activity-hide-note-column/spec.md)           | Hide Activity Note column                                    | Accepted                                                                     |
| [052](052-month-breakdown-titles/spec.md)              | Month breakdown titles (Income / Expenses)                   | Accepted                                                                     |
| [053](053-void-outline-danger-fill/spec.md)            | Void outline + danger fill                                   | Accepted                                                                     |
| [054](054-tx-header-icon/spec.md)                      | Transaction header icons                                     | Accepted                                                                     |
| [055](055-confirm-above-tx-modal/spec.md)              | Confirm above transaction modal                              | Accepted                                                                     |
| [056](056-category-in-use-warn/spec.md)                | Category in-use warn dialog                                  | Accepted                                                                     |
| [057](057-confirm-danger-chrome/spec.md)               | ConfirmDialog danger chrome                                  | Accepted                                                                     |
| [058](058-activity-filters-always-drawer/spec.md)      | Always-on Activity filters drawer                            | Accepted                                                                     |
| [059](059-remove-net-worth/spec.md)                    | Remove Net worth                                             | Accepted                                                                     |
| [060](060-goals-have-x-by-y/spec.md)                   | Goals — have X by Y + Home strip                             | Accepted                                                                     |
| [061](061-more-cards-icons-padding/spec.md)            | More cards padding + icons                                   | Accepted                                                                     |
| [062](062-test-coverage-audit/spec.md)                 | Codebase test coverage audit                                 | Accepted                                                                     |
| [063](063-activity-list-rows/spec.md)                  | Activity list rows like Recent                               | Accepted                                                                     |
| [064](064-activity-sort-sheet/spec.md)                 | Activity Sort sheet + icon Filters                           | Accepted                                                                     |
| [065](065-activity-active-toolbar-icons/spec.md)       | Active Sort/Filters icon chrome                              | Accepted                                                                     |
| [066](066-recent-see-more/spec.md)                     | Recent see more → Activity                                   | Accepted                                                                     |
| [067](067-remove-category-sort/spec.md)                | Remove Categories sort                                       | Accepted                                                                     |
| [068](068-activity-date-groups/spec.md)                | Activity date groups + note secondary                        | Accepted                                                                     |
| [069](069-activity-chunked-reveal/spec.md)             | Activity chunked reveal (whole days)                         | Accepted                                                                     |
| [070](070-pockets-nav-crud/spec.md)                    | Pockets nav + CRUD + Main + order                            | Accepted                                                                     |
| [071](071-pocket-opening-balance/spec.md)              | Pocket opening balance + derived balance                     | Accepted                                                                     |
| [072](072-pocket-goals/spec.md)                        | Pocket goals; retire Home/More goals                         | Accepted                                                                     |
| [073](073-transfer-transactions/spec.md)               | Normal / Transfer add; immutable type; neutral badge         | Accepted                                                                     |
| [074](074-pockets-copy-docs/spec.md)                   | Accounts → Pockets copy + docs                               | Accepted                                                                     |
| [075](075-activity-pocket-filter/spec.md)              | Activity filter by pocket                                    | Accepted                                                                     |
| [076](076-activity-row-secondary/spec.md)              | Activity row date/note + empty-secondary chrome              | Accepted                                                                     |
| [077](077-row-pocket-labels/spec.md)                   | Pocket under amount; transfer row chrome                     | Accepted                                                                     |
| [078](078-tx-pocket-picker/spec.md)                    | Pocket picker on Normal add/edit                             | Accepted                                                                     |
| [079](079-tx-inline-field-errors/spec.md)              | Inline field errors on all forms                             | Accepted                                                                     |
| [080](080-dirty-modal-keep-open/spec.md)               | Dirty modal keep-open on discard                             | Accepted                                                                     |
| [081](081-tx-mode-tabs-chrome/spec.md)                 | Tx mode tabs default chrome                                  | Accepted                                                                     |
| [082](082-bottom-sheet-expand/spec.md)                 | Bottom sheet expand to fit                                   | Accepted                                                                     |
| [083](083-remove-header-account-subtitle/spec.md)      | Remove header Account subtitle                               | Accepted                                                                     |
| [084](084-activity-add-transaction-label/spec.md)      | Activity Add → Add Transaction                               | Accepted                                                                     |
| [085](085-dirty-outside-discard-fix/spec.md)           | Dirty outside discard fix                                    | Accepted                                                                     |
| [086](086-pocket-optional-opening-goal/spec.md)        | Optional opening + goal checkboxes                           | Accepted                                                                     |
| [087](087-remove-recurring/spec.md)                    | Remove recurring feature                                     | Accepted                                                                     |
| [088](088-tabs-active-indicator/spec.md)               | Tabs active indicator (data-active)                          | Accepted                                                                     |
| [089](089-show-amounts-passphrase/spec.md)             | Show money passphrase when locked                            | Accepted                                                                     |
| [090](090-header-quick-lock/spec.md)                   | Header quick-lock                                            | Accepted                                                                     |
| [091](091-pocket-helpers-goal-date-suffix/spec.md)     | Pocket helpers + goal-date suffix                            | Accepted                                                                     |
| [092](092-pocket-label-beside-date/spec.md)            | Pocket label beside date                                     | Accepted                                                                     |
| [093](093-pocket-card-actions-bottom/spec.md)          | Pocket card actions bottom                                   | Accepted                                                                     |
| [094](094-pocket-description-footer/spec.md)           | Pocket description footer                                    | Accepted                                                                     |
| [095](095-month-summary-header-padding/spec.md)        | Month summary header equal padding                           | Accepted                                                                     |
| [096](096-pocket-under-amount-date-row/spec.md)        | Pocket under amount, date-aligned                            | Accepted                                                                     |
| [097](097-pocket-row-center-no-goal/spec.md)           | Pocket row center when no goal                               | Accepted                                                                     |
| [098](098-pocket-bottom-with-note/spec.md)             | Pocket bottom-aligned when note present                      | Superseded by [099](099-amount-pocket-center-stack/spec.md)                  |
| [099](099-amount-pocket-center-stack/spec.md)          | Tight amount+pocket stack, vertically centered               | Accepted                                                                     |
| [100](100-datefield-mobile-picker/spec.md)             | DateField opens on mobile                                    | Accepted                                                                     |
| [101](101-activity-date-sort-created-at/spec.md)       | Activity date sort secondary by createdAt                    | Accepted                                                                     |
| [102](102-activity-session-sort-filters/spec.md)       | Activity session sort + filters persistence                  | Accepted                                                                     |
| [103](103-modal-first-input-focus/spec.md)             | Modal first-input autofocus                                  | Accepted                                                                     |
| [103](103-soft-delete-void-only-categories/spec.md)    | Soft-delete void-only categories                             | Accepted                                                                     |
| [104](104-create-form-draft-discard/spec.md)           | Create-form draft on discard (session)                       | Accepted                                                                     |
| [105](105-pocket-amount-field-format/spec.md)          | Pocket amount field format                                   | Accepted                                                                     |
| [106](106-transfer-admin-fee/spec.md)                  | Transfer admin fee                                           | Accepted                                                                     |
| [107](107-filter-category-picker/spec.md)              | Filter category dropdown + type coupling                     | Accepted                                                                     |
| [108](108-pocket-description-one-line/spec.md)         | Pocket description one line                                  | Accepted                                                                     |
| [109](109-month-summary-bounds/spec.md)                | Month summary range bounds                                   | Accepted                                                                     |
| [110](110-month-opening-from-pockets/spec.md)          | Month opening from pocket openings                           | Accepted                                                                     |
| [111](111-mobile-control-heights/spec.md)              | Mobile control heights                                       | Accepted                                                                     |
| [112](112-mobile-compact-button-heights/spec.md)       | Mobile compact button heights                                | Accepted                                                                     |
| [113](113-compound-control-scale/spec.md)              | Compound control scale after mobile heights                  | Accepted                                                                     |
| [114](114-mobile-checkbox-scale/spec.md)               | Mobile checkbox scale                                        | Accepted                                                                     |
| [115](115-docs-unlock-local-first-cloud/spec.md)       | Docs unlock — local-first + optional cloud                   | Accepted                                                                     |
| [116](116-github-actions-ci/spec.md)                   | Restore GitHub Actions CI                                    | Accepted                                                                     |
| [117](117-sveltekit-path-urls-pwa/spec.md)             | SvelteKit path URLs + PWA                                    | Accepted                                                                     |
| [118](118-gcp-cloud-run-web/spec.md)                   | Cloud Run web + path-filtered Actions; retire Cloudflare     | Accepted                                                                     |
| [119](119-google-sign-in-account-lock/spec.md)         | Google Sign-In, account passphrase, hex kit, session manager | Accepted                                                                     |
| [120](120-local-dek-wrapping-encrypted-backup/spec.md) | Always-on local DEK wrapping; encrypted local-only backup    | Accepted                                                                     |
| [121](121-signed-in-sync/spec.md)                      | Signed-in sync (rev, 409, gravestones, poll, settings)       | Accepted                                                                     |
| [122](122-android-second-repo-parked/spec.md)          | Android later (second GitHub repo)                           | Accepted (parked)                                                            |
| [123](123-category-groups-default-catalog/spec.md)     | Overlay catalog, Categories list, searchable form picker     | Accepted                                                                     |
| [124](124-categories-kind-tabs-search/spec.md)         | Categories kind tabs, search, hover chips                    | Accepted                                                                     |
| [125](125-categories-reorder-session-chrome/spec.md)   | Categories reorder session and chrome                        | Accepted                                                                     |
| [126](126-categories-mobile-chrome-tap-hide/spec.md)   | Categories mobile chrome, tap-to-hide, long-press edit       | Accepted                                                                     |
| [127](127-categories-reorder-drop-between/spec.md)     | Categories reorder drop-between                              | Accepted — handle-only superseded by [147](147-categories-reorder-whole-row-drag/spec.md) |
| [128](128-categories-stage-grid/spec.md)               | Categories stage-width grid                                  | Accepted                                                                     |
| [129](129-categories-toolbar-full-width/spec.md)        | Categories toolbar full width on small screens               | Accepted                                                                     |
| [130](130-picker-search-group-label/spec.md)            | CategoryPicker search matches group labels                   | Accepted                                                                     |
| [131](131-group-header-actions/spec.md)                 | Categories group header actions                              | Accepted                                                                     |
| [132](132-activity-filter-used-categories/spec.md)      | Activity category filter used-only                           | Accepted                                                                     |
| [133](133-visual-system/spec.md)                         | Visual system (Mist / Ink / Figtree)                         | Accepted                                                                     |
| [134](134-transactions-panel/spec.md)                    | Transactions panel rename + mutations list                   | Accepted                                                                        |
| [135](135-datefield-picker/spec.md)                      | DateField picker restore                                     | Accepted                                                                        |
| [136](136-transactions-row-note-category/spec.md)        | Transactions row note primary + category icon                | Accepted                                                                        |
| [137](137-signed-amount-format/spec.md)                  | Signed amounts after currency                                | Accepted                                                                        |
| [138](138-pocket-label-optical-align/spec.md)            | PocketLabel Main text optical alignment                      | Accepted                                                                        |
| [139](139-filter-multi-select/spec.md)                   | Filters Type / Category / Pocket multi-select                | Accepted                                                                        |
| [140](140-show-voided-filter/spec.md)                    | Voided hidden by default; Show voided                        | Accepted                                                                        |
| [141](141-transactions-date-range/spec.md)               | Transactions header date range (month or custom)             | Accepted — header placement superseded by [142](142-transactions-range-picker/spec.md) |
| [142](142-transactions-range-picker/spec.md)             | Transactions range picker + sticky chrome band               | Accepted — live-apply superseded by [143](143-range-picker-apply/spec.md) |
| [143](143-range-picker-apply/spec.md)                    | Range picker Apply / Close draft; To-hover preview           | Accepted                                                                        |
| [144](144-filter-check-menus/spec.md)                    | Type / Pocket filter checkboxes like Category                | Accepted                                                                        |
| [145](145-remove-amount-filter/spec.md)                  | Remove Filters Amount compare                                | Accepted                                                                        |
| [146](146-reorder-reset-both-discard-confirm/spec.md)    | Reorder Reset both kinds + Discard confirm                   | Accepted                                                                        |
| [147](147-categories-reorder-whole-row-drag/spec.md)     | Categories reorder whole-row drag                            | Accepted                                                                        |
