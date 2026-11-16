# React date-range reporting filter

Standalone Vite/React example using `@revolist/ui@4.0.25` and its public date utilities. All invoices are fictional; the reporting date is fixed at 16 November 2026 so results stay reproducible.

## Run

Requires Node.js 22.18 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Date utilities

`src/report.ts` imports `isValidIsoDate`, `addDays`, `diffInCalendarDays`, `startOfMonth`, and `formatCalendarDateDisplay` from `@revolist/ui/dates`. The example owns reporting rules such as the 31-day maximum, inclusive endpoints, invoice filtering, and draft-versus-applied state. Date validation, arithmetic, and formatting come from the library.

The default range is November 10–16: four invoices totaling $4,000.00. **This month** changes the draft to November 1–16. **Apply filters** updates the report to seven invoices totaling $5,330.00. Rejected ranges retain the previous report; **Reset** restores both draft and applied dates. November 5–6 produces a valid empty result.

## Validate

```bash
npm run build
npm test
npx playwright install chromium
npm run dev -- --port 5174 --strictPort
# In another terminal:
npm run test:browser
```

Set `BASE_URL` to test another server or `CHROMIUM_PATH` to use an existing browser executable. Unit tests cover invalid dates, leap years, UTC arithmetic, inclusive limits, fixture totals, and English/French formatting. The browser smoke suite checks presets, Apply, validation retention, Reset, empty results, calendar dismissal, mobile width, and page errors.

`vite.config.ts` preserves the optional PDF imports in the React adapter during dependency prebundling and explicitly optimizes React dependencies. Keep it when copying the example.

## References

- [Revo UI](https://ui.rv-grid.com/)
- [Calendar and date components](https://ui.rv-grid.com/components/calendar-and-dates/)
- [Published UI package](https://www.npmjs.com/package/@revolist/ui/v/4.0.25)

