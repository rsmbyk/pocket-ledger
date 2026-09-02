# Tasks 135: DateField picker restore

Draft — do not implement until Ronald Accepts.

- [ ] Branch: `feat/135-datefield-picker` after Accept (or stack after 134 if needed)
- [ ] DateField: `showPicker()` on click/pointerup; indicator covers the input; keep opacity-0 overlay
- [ ] Guard dialog/sheet interact-outside if the native popup dismisses immediately
- [ ] Playwright `e2e/date-field.e2e.ts` — click path + `showPicker` spy; keep `fill()`; disabled/trailing unchanged
- [ ] `npx playwright test e2e/date-field.e2e.ts`
- [ ] Manual: Add tx Date, pocket opening/goal, any header DateFields (141) in Chrome
